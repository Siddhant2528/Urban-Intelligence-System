import pytest

from app.ai import profile_generator


@pytest.mark.asyncio
async def test_profile_uses_deterministic_fallback_without_gemini_key(monkeypatch):
    monkeypatch.setattr(profile_generator.settings, "GEMINI_API_KEY", "")

    async def unexpected_gemini_call(*args, **kwargs):
        raise AssertionError("Gemini must not be called without an API key")

    monkeypatch.setattr(profile_generator, "call_gemini", unexpected_gemini_call)

    result = await profile_generator.generate_development_profile(
        "Ward One",
        [
            {"category": "Healthcare", "score": 45.0, "raw_metric": "1.6"},
            {"category": "Education", "score": 78.0, "raw_metric": "5.0"},
        ],
    )

    assert result["model_used"] == "deterministic-rule-engine"
    assert result["profile"]["constraints"] == ["healthcare_constraint"]
    assert result["profile"]["limitations"]
