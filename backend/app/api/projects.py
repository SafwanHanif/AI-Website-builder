from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from app.database.connection import get_db
from app.models.user import User
from app.models.project import Project
from app.models.component import Component
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.auth.dependencies import get_current_user
from app.ai.pipeline import generate_website
from app.websocket.manager import broadcast_progress
import json

router = APIRouter()


@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    projects = (
        db.query(Project)
        .filter(Project.user_id == current_user.id)
        .order_by(desc(Project.updated_at))
        .all()
    )
    return [ProjectResponse.model_validate(p) for p in projects]


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = Project(
        user_id=current_user.id,
        title=data.title,
        description=data.description,
        prompt=data.prompt,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectResponse.model_validate(project)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if str(project.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    return ProjectResponse.model_validate(project)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if str(project.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    if data.title is not None:
        project.title = data.title
    if data.description is not None:
        project.description = data.description

    db.commit()
    db.refresh(project)
    return ProjectResponse.model_validate(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if str(project.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(project)
    db.commit()


@router.post("/{project_id}/generate")
async def generate(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if str(project.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Trigger AI generation (runs in background)
    await generate_website(project, db)

    return {"message": "Generation started", "project_id": project_id}


@router.post("/{project_id}/edit")
async def edit_with_ai(
    project_id: str,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.schemas.edit import AIEditRequest
    edit_req = AIEditRequest(**data)
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if str(project.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Load existing components
    components = db.query(Component).filter(Component.project_id == project.id).order_by(Component.order_num).all()

    from app.ai.pipeline import edit_website
    result = await edit_website(project, components, edit_req.prompt, db)

    return result
