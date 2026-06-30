from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class VersionCreate(BaseModel):
    message: Optional[str] = None


class VersionResponse(BaseModel):
    id: str
    version_number: int
    snapshot_json: Any
    message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
