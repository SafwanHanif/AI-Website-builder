"""Groq AI provider — uses Groq Cloud via OpenAI-compatible API."""

from typing import Optional
from openai import OpenAI
from app.ai.base import BaseAIProvider, AIProviderError
from app.config import settings


class GroqProvider(BaseAIProvider):
    """Groq Cloud AI provider (OpenAI-compatible API)."""

    def __init__(self):
        if not settings.groq_api_key:
            raise AIProviderError("GROQ_API_KEY is not configured")
        self.client = OpenAI(
            api_key=settings.groq_api_key,
            base_url="https://api.groq.com/openai/v1",
        )
        self.model = settings.groq_model

    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=4096,
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            raise AIProviderError(f"Groq generation failed: {str(e)}")

    async def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> dict:
        import json

        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})

            # Instruct the model to return valid JSON
            json_prompt = (
                prompt
                + "\n\nReturn ONLY valid JSON. No markdown, no code fences, no explanation — raw JSON only."
            )
            messages.append({"role": "user", "content": json_prompt})

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.2,  # Lower temp for structured output
                max_tokens=4096,
            )
            text = response.choices[0].message.content or ""

            # Clean up common wrapping
            text = text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

            return json.loads(text)
        except json.JSONDecodeError as e:
            # Fallback: try to find a JSON object in the response
            import re
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                return json.loads(match.group())
            raise AIProviderError(f"Failed to parse JSON from Groq response: {e}")
        except Exception as e:
            raise AIProviderError(f"Groq JSON generation failed: {str(e)}")
