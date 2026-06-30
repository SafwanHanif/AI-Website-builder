from typing import Optional
from app.ai.base import BaseAIProvider, AIProviderError
from app.config import settings


class GeminiProvider(BaseAIProvider):
    """Google Gemini AI provider."""

    def __init__(self):
        if not settings.gemini_api_key:
            raise AIProviderError("GEMINI_API_KEY is not configured")
        try:
            from google import genai
            self.client = genai.Client(api_key=settings.gemini_api_key)
        except ImportError:
            raise AIProviderError("google-genai package not installed")

    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        try:
            contents = []
            if system_prompt:
                contents.append({"role": "user", "parts": [{"text": system_prompt}]})
                contents.append({"role": "model", "parts": [{"text": "Understood. I will follow these instructions carefully."}]})
            contents.append({"role": "user", "parts": [{"text": prompt}]})

            response = self.client.models.generate_content(
                model=settings.gemini_model,
                contents=contents,
            )
            return response.text
        except Exception as e:
            raise AIProviderError(f"Gemini generation failed: {str(e)}")

    async def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> dict:
        import json
        text = await self.generate(prompt, system_prompt)
        # Extract JSON from the response
        text = text.strip()
        # Handle code blocks
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            # Try to find JSON object in the response
            import re
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                return json.loads(match.group())
            raise AIProviderError(f"Failed to parse JSON from response: {e}")
