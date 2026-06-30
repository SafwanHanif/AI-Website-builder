from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from app.database.connection import get_db
from app.models.user import User
from app.models.project import Project
from app.models.version import Version
from app.models.component import Component
from app.schemas.version import VersionCreate, VersionResponse
from app.auth.dependencies import get_current_user

router = APIRouter()


@router.get("/{project_id}/versions", response_model=List[VersionResponse])
async def list_versions(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if str(project.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    versions = (
        db.query(Version)
        .filter(Version.project_id == project.id)
        .order_by(desc(Version.version_number))
        .all()
    )
    return [VersionResponse.model_validate(v) for v in versions]


@router.post("/{project_id}/versions", response_model=VersionResponse)
async def create_version(
    project_id: str,
    data: VersionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if str(project.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Build snapshot from current state
    components = db.query(Component).filter(Component.project_id == project.id).all()
    snapshot = {
        "components": [
            {
                "name": c.name,
                "code": c.code,
                "file_path": c.file_path,
                "order_num": c.order_num,
            }
            for c in components
        ]
    }

    max_ver = db.query(Version).filter(Version.project_id == project.id).count()
    version = Version(
        project_id=project.id,
        version_number=max_ver + 1,
        snapshot_json=snapshot,
        message=data.message,
    )
    db.add(version)
    db.commit()
    db.refresh(version)
    return VersionResponse.model_validate(version)


@router.post("/{project_id}/versions/{version_id}/restore")
async def restore_version(
    project_id: str,
    version_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if str(project.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    version = db.query(Version).filter(Version.id == version_id).first()
    if not version or str(version.project_id) != str(project.id):
        raise HTTPException(status_code=404, detail="Version not found")

    # Delete current components and restore from snapshot
    db.query(Component).filter(Component.project_id == project.id).delete()

    snapshot = version.snapshot_json
    for comp_data in snapshot.get("components", []):
        component = Component(
            project_id=project.id,
            name=comp_data["name"],
            code=comp_data["code"],
            file_path=comp_data.get("file_path", ""),
            order_num=comp_data.get("order_num", 0),
        )
        db.add(component)

    db.commit()
    return {"message": f"Restored version {version.version_number}"}
