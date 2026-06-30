from pydantic import BaseModel
from typing import Optional, Any, List
from datetime import datetime


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    prompt: str


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class ComponentResponse(BaseModel):
    id: str
    name: str
    code: str
    file_path: str
    order_num: int

    class Config:
        from_attributes = True


class WebsitePlanResponse(BaseModel):
    id: str
    plan_json: Any
    created_at: datetime

    class Config:
        from_attributes = True


class DesignTokenResponse(BaseModel):
    id: str
    tokens_json: Any
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    prompt: str
    created_at: datetime
    updated_at: datetime
    website_plan: Optional[WebsitePlanResponse] = None
    design_tokens: Optional[DesignTokenResponse] = None
    components: List[ComponentResponse] = []

    class Config:
        from_attributes = True
