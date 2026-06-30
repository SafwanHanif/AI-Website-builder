"""Service to generate export ZIP files for projects."""

import os
import zipfile
import tempfile
import json
from typing import List
from app.models.project import Project
from app.models.component import Component


def generate_export_zip(project: Project, components: List[Component]) -> str:
    """Generate a ZIP file containing the full React project."""
    temp_dir = tempfile.mkdtemp()
    zip_filename = os.path.join(temp_dir, f"{project.id}.zip")

    with zipfile.ZipFile(zip_filename, "w", zipfile.ZIP_DEFLATED) as zf:
        # package.json
        package_json = {
            "name": project.title.lower().replace(" ", "-"),
            "version": "1.0.0",
            "private": True,
            "dependencies": {
                "react": "^18.3.1",
                "react-dom": "^18.3.1",
                "react-scripts": "5.0.1",
            },
            "scripts": {
                "start": "react-scripts start",
                "build": "react-scripts build",
            },
            "browserslist": {
                "production": [">0.2%", "not dead", "not op_mini all"],
                "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"],
            },
        }
        zf.writestr("package.json", json.dumps(package_json, indent=2))

        # public/index.html
        index_html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
</head>
<body>
  <div id="root"></div>
</body>
</html>""".format(title=project.title)
        zf.writestr("public/index.html", index_html)

        # src/index.js
        zf.writestr("src/index.js", """import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
""")

        # Component files
        for comp in components:
            if comp.file_path:
                zf.writestr(comp.file_path, comp.code)

        # App.jsx (find or create)
        app_components = [c for c in components if c.name == "App"]
        if app_components:
            zf.writestr("src/App.jsx", app_components[0].code)

        # globals.css
        globals_css = _generate_globals_css(components)
        zf.writestr("src/styles/globals.css", globals_css)

        # .env
        zf.writestr(".env", "SKIP_PREFLIGHT_CHECK=true\n")

    return zip_filename


def _generate_globals_css(components: List[Component]) -> str:
    """Generate a global CSS file with base styles."""
    return """* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img {
  max-width: 100%;
  height: auto;
}

a {
  text-decoration: none;
  color: inherit;
}

/* Utility classes */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 0 2rem;
  }
}
"""
