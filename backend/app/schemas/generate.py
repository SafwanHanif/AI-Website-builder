from pydantic import BaseModel
from typing import Optional, Any


class GenerateRequest(BaseModel):
    pass  # Uses the project's stored prompt


class GenerateProgress(BaseModel):
    step: str  # plan, tokens, copy, components, build, done, error
    status: str  # started, in_progress, complete
    component: Optional[str] = None
    data: Optional[Any] = None
    message: Optional[str] = None
