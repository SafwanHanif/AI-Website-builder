from pydantic import BaseModel


class AIEditRequest(BaseModel):
    prompt: str


class AIEditResponse(BaseModel):
    message: str
    version_number: int
    changed_components: list[str]
