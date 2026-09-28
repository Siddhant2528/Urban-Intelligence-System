"""
Gemini API client.
Thin wrapper — just handles the HTTP call and error handling.
"""
import httpx
import json
from app.core.config import settings

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"


async def call_gemini(prompt: str, max_tokens: int = 1000) -> str:
    """
    Call the Gemini API with a prompt and return the text response.
    
    Args:
        prompt: The complete prompt to send
        max_tokens: Maximum tokens in the response
    
    Returns:
        Raw text response from Gemini
    
    Raises:
        httpx.HTTPError: On API errors
        ValueError: If response format is unexpected
    """
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "maxOutputTokens": max_tokens,
            "temperature": 0.2,  # Low temperature for consistent structured output
        }
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{GEMINI_API_URL}?key={settings.GEMINI_API_KEY}",
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
    
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as e:
        raise ValueError(f"Unexpected Gemini response format: {data}") from e