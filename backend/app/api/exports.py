from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.models.project import Project
from app.models.component import Component
from app.auth.dependencies import get_current_user
from app.services.export_service import generate_export_zip
import tempfile
import os

router = APIRouter()


@router.get("/{project_id}/export")
async def export_project(
    project_id: str,
    format: str = "zip",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if str(project.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    components = db.query(Component).filter(Component.project_id == project.id).order_by(Component.order_num).all()

    if format == "zip":
        zip_path = generate_export_zip(project, components)
        return FileResponse(
            zip_path,
            media_type="application/zip",
            filename=f"{project.title.lower().replace(' ', '_')}.zip",
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {format}")
