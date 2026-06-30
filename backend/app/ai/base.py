from abc import ABC, abstractmethod
from typing import Optional


class AIProviderError(Exception):
    """Base exception for AI provider errors."""
    pass


class BaseAIProvider(ABC):
    """Abstract base for AI providers (Gemini, OpenAI, Claude, GLM)."""

    @abstractmethod
    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Send a prompt to the AI and return the text response."""
        pass

    @abstractmethod
    async def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> dict:
        """Send a prompt and get a structured JSON response back."""
        pass
