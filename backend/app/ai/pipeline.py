"""AI Pipeline orchestrator — runs generation steps in sequence, streaming progress via WebSocket."""

import json
import os
from typing import List
from sqlalchemy.orm import Session
from app.ai.base import AIProviderError
from app.ai.groq import GroqProvider
from app.ai.gemini import GeminiProvider
from app.models.project import Project
from app.models.website_plan import WebsitePlan
from app.models.design_token import DesignToken
from app.models.component import Component
from app.models.version import Version
from app.models.chat_history import ChatHistory
from app.websocket.manager import broadcast_progress
from app.config import settings


def _get_provider():
    """Factory to get the configured AI provider."""
    provider_name = settings.ai_provider.lower()
    if provider_name == "groq":
        return GroqProvider()
    elif provider_name == "gemini":
        return GeminiProvider()
    elif provider_name == "openai":
        raise AIProviderError("OpenAI provider not yet implemented")
    elif provider_name == "claude":
        raise AIProviderError("Claude provider not yet implemented")
    elif provider_name == "glm":
        raise AIProviderError("GLM provider not yet implemented")
    else:
        raise AIProviderError(f"Unknown AI provider: {provider_name}")


def _load_prompt(name: str) -> str:
    """Load a prompt template from the prompts directory."""
    prompts_dir = os.path.join(os.path.dirname(__file__), "..", "prompts")
    filepath = os.path.join(prompts_dir, f"{name}.txt")
    with open(filepath, "r") as f:
        return f.read()


async def generate_website(project: Project, db: Session):
    """Run the full AI generation pipeline for a project."""
    provider = _get_provider()

    try:
        # === STEP 1: Planner ===
        await broadcast_progress(str(project.id), "plan", "started")
        plan_prompt = _load_prompt("planner").replace("{{prompt}}", project.prompt)
        plan = await provider.generate_json(plan_prompt)

        # Store plan
        website_plan = WebsitePlan(project_id=project.id, plan_json=plan)
        db.add(website_plan)
        db.commit()
        await broadcast_progress(str(project.id), "plan", "complete", data=plan)

        # === STEP 2: Design Tokens ===
        await broadcast_progress(str(project.id), "tokens", "started")
        tokens_prompt = _load_prompt("design_tokens").replace(
            "{{plan}}", json.dumps(plan, indent=2)
        )
        tokens = await provider.generate_json(tokens_prompt)

        design_token = DesignToken(project_id=project.id, tokens_json=tokens)
        db.add(design_token)
        db.commit()
        await broadcast_progress(str(project.id), "tokens", "complete", data=tokens)

        # === STEP 3: Copywriting ===
        await broadcast_progress(str(project.id), "copy", "started")
        copy_prompt = _load_prompt("copy").replace(
            "{{plan}}", json.dumps(plan, indent=2)
        ).replace("{{tokens}}", json.dumps(tokens, indent=2))
        copy_content = await provider.generate(copy_prompt)

        # Store AI's copy response in chat history
        chat = ChatHistory(
            project_id=project.id,
            role="ai",
            content=f"Generated website copy:\n\n{copy_content}",
        )
        db.add(chat)
        db.commit()
        await broadcast_progress(str(project.id), "copy", "complete", data={"copy": copy_content})

        # === STEP 4: Generate Components ===
        sections = plan.get("sections", [])
        await broadcast_progress(str(project.id), "components", "started", total=len(sections))

        component_prompt_template = _load_prompt("component")
        for idx, section in enumerate(sections):
            await broadcast_progress(
                str(project.id), "component", "started",
                component=section, index=idx, total=len(sections)
            )

            comp_prompt = component_prompt_template.replace(
                "{{section}}", section
            ).replace("{{plan}}", json.dumps(plan, indent=2)).replace(
                "{{tokens}}", json.dumps(tokens, indent=2)
            ).replace(
                "{{copy}}", copy_content
            )

            code = await provider.generate(comp_prompt)

            # Determine file path and name
            component_name = section.replace(" ", "")
            file_path = f"src/components/{component_name}.jsx"

            component = Component(
                project_id=project.id,
                name=component_name,
                code=code,
                file_path=file_path,
                order_num=idx,
            )
            db.add(component)
            db.commit()

            await broadcast_progress(
                str(project.id), "component", "complete",
                component=section, index=idx, total=len(sections)
            )

        # === STEP 5: Build project ===
        await broadcast_progress(str(project.id), "build", "started")

        # Generate a main App.jsx that imports all components
        components = db.query(Component).filter(Component.project_id == project.id).order_by(Component.order_num).all()
        app_code = _generate_app_component(components, plan, tokens)
        app_component = Component(
            project_id=project.id,
            name="App",
            code=app_code,
            file_path="src/App.jsx",
            order_num=len(sections) + 1,
        )
        db.add(app_component)

        # Generate index.js entry point
        index_code = _generate_index_entry(plan)
        index_component = Component(
            project_id=project.id,
            name="IndexEntry",
            code=index_code,
            file_path="src/index.js",
            order_num=len(sections) + 2,
        )
        db.add(index_component)

        db.commit()

        # Auto-save as version 1
        all_components = db.query(Component).filter(Component.project_id == project.id).all()
        snapshot = {
            "components": [
                {
                    "name": c.name,
                    "code": c.code,
                    "file_path": c.file_path,
                    "order_num": c.order_num,
                }
                for c in all_components
            ]
        }
        version = Version(
            project_id=project.id,
            version_number=1,
            snapshot_json=snapshot,
            message="Initial generation",
        )
        db.add(version)
        db.commit()

        await broadcast_progress(str(project.id), "build", "complete")
        await broadcast_progress(str(project.id), "done", "complete", project_id=str(project.id))

    except AIProviderError as e:
        await broadcast_progress(str(project.id), "error", "failed", message=str(e))
        raise
    except Exception as e:
        await broadcast_progress(str(project.id), "error", "failed", message=str(e))
        raise


async def edit_website(project: Project, components: List[Component], edit_prompt: str, db: Session):
    """Edit the website based on a user's natural language edit request."""
    provider = _get_provider()
    edit_template = _load_prompt("edit")

    changed_components = []

    for comp in components:
        # For each component, ask AI if this edit applies and update if so
        full_prompt = edit_template.replace(
            "{{edit_prompt}}", edit_prompt
        ).replace(
            "{{component_name}}", comp.name
        ).replace(
            "{{component_code}}", comp.code
        )

        result = await provider.generate_json(full_prompt)

        if result.get("should_modify", False):
            comp.code = result.get("code", comp.code)
            db.add(comp)
            changed_components.append(comp.name)

    # Save as new version
    if changed_components:
        db.commit()
        all_components = db.query(Component).filter(Component.project_id == project.id).all()
        snapshot = {
            "components": [
                {
                    "name": c.name,
                    "code": c.code,
                    "file_path": c.file_path,
                    "order_num": c.order_num,
                }
                for c in all_components
            ]
        }
        max_ver = db.query(Version).filter(Version.project_id == project.id).count()
        version = Version(
            project_id=project.id,
            version_number=max_ver + 1,
            snapshot_json=snapshot,
            message=edit_prompt,
        )
        db.add(version)
        db.commit()

        await broadcast_progress(str(project.id), "edit", "complete", changed_components=changed_components)

    return {
        "message": f"Updated {len(changed_components)} component(s)" if changed_components else "No changes needed",
        "version_number": max_ver + 1 if changed_components else None,
        "changed_components": changed_components,
    }


def _generate_app_component(components: List[Component], plan: dict, tokens: dict) -> str:
    """Generate the main App.jsx that composes all sections."""
    imports = "\n".join([
        f"import {c.name} from './components/{c.name}';"
        for c in components
    ])
    sections_jsx = "\n      ".join([
        f"<{c.name} />"
        for c in components
    ])

    # Extract tokens for CSS variables
    token_vars = ""
    if tokens:
        colors = tokens.get("colors", {})
        for key, value in colors.items():
            token_vars += f"  --{key}: {value};\n"
        typography = tokens.get("typography", {})
        font_family = typography.get("font_family", "Inter, sans-serif")
    else:
        font_family = "Inter, sans-serif"

    return f"""import React from 'react';
{imports}

function App() {{
  return (
    <div className="app" style={{\n      fontFamily: '{font_family}',\n    }}>
      {sections_jsx}
    </div>
  );
}}

export default App;
"""


def _generate_index_entry(plan: dict) -> str:
    """Generate the index.js entry point."""
    return """import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"""
