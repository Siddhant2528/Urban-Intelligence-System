"""
Development Profile Generator
Sends indicator data to Gemini and gets back a structured area profile.

CRITICAL: AI only interprets. It does not calculate scores, weights, or UIS.
The returned profile is validated against a schema before use.
"""
import json
import logging
from pydantic import BaseModel, field_validator
from typing import Optional
from app.ai.gemini_client import call_gemini
from app.core.config import settings


PROMPT_VERSION = "v1.0"
logger = logging.getLogger(__name__)


class DevelopmentProfile(BaseModel):
    """Pydantic schema for AI-generated profile. Validates AI output."""
    profile_name: str
    dominant_characteristics: list[str]
    strengths: list[str]
    constraints: list[str]
    contextual_priorities: list[str]
    evidence_indicators: list[str]
    limitations: Optional[str] = None
    
    @field_validator("dominant_characteristics", "strengths", "constraints", 
                    "contextual_priorities", "evidence_indicators")
    @classmethod
    def must_not_be_empty(cls, v):
        if not v:
            raise ValueError("List fields must contain at least one item")
        return v


def build_profile_prompt(area_name: str, indicator_data: list[dict]) -> str:
    """
    Build the prompt for development profile generation.
    
    indicator_data: [{"category": str, "score": float, "raw_metric": str}, ...]
    """
    indicator_text = "\n".join([
        f"- {d['category']}: score {d['score']:.1f}/100 (raw: {d.get('raw_metric', 'N/A')})"
        for d in indicator_data
    ])
    
    return f"""You are an urban development analyst. Analyze the following indicator data for the area "{area_name}" and produce a structured development profile.

INDICATOR DATA:
{indicator_text}

CONSTRAINTS:
- Do NOT invent statistics or raw data values not provided above
- Do NOT calculate or suggest numerical scores or weights
- Base your analysis ONLY on the provided indicator scores
- Be specific about which indicators support each characterization

Respond ONLY with a valid JSON object in this exact format (no markdown, no backticks):
{{
    "profile_name": "A concise 3-8 word profile name",
    "dominant_characteristics": ["characteristic 1", "characteristic 2"],
    "strengths": ["strength 1", "strength 2"],
    "constraints": ["constraint 1", "constraint 2"],
    "contextual_priorities": ["priority 1", "priority 2"],
    "evidence_indicators": ["indicator category that supports this characterization"],
    "limitations": "Any data gaps or caveats about this profile"
}}

The "constraints" field must use ONLY these standard constraint keys when applicable:
healthcare_constraint, infrastructure_constraint, transport_constraint, education_constraint, environment_pressure

If none of those apply, describe the constraint in plain English instead."""


async def generate_development_profile(
    area_name: str,
    indicator_data: list[dict],
) -> dict:
    """
    Generate and validate a development profile for an area.
    
    Returns:
        Validated profile dict plus metadata
    
    Raises:
        ValueError: If AI returns invalid JSON or fails schema validation
    """
    if settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_"):
        try:
            raw_response = await call_gemini(
                build_profile_prompt(area_name, indicator_data),
                max_tokens=800,
            )

            cleaned = raw_response.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]

            profile = DevelopmentProfile(**json.loads(cleaned.strip()))
            return {
                "profile": profile.model_dump(),
                "prompt_version": PROMPT_VERSION,
                "model_used": "gemini-1.5-flash",
            }
        except Exception as exc:
            # The UIS calculation must remain available if Gemini is down,
            # misconfigured, or returns an invalid profile.
            logger.warning(
                "Gemini profile generation failed; using deterministic fallback (%s)",
                type(exc).__name__,
            )

    return {
        "profile": build_deterministic_profile(indicator_data),
        "prompt_version": PROMPT_VERSION,
        "model_used": "deterministic-rule-engine",
    }


def build_deterministic_profile(indicator_data: list[dict]) -> dict:
    """Create a transparent profile from supplied indicator scores only."""
    if not indicator_data:
        raise ValueError("Cannot build a development profile without indicator data")

    ordered = sorted(indicator_data, key=lambda item: float(item["score"]))
    lowest = ordered[0]
    highest = ordered[-1]
    low_indicators = [item for item in ordered if float(item["score"]) < 60]
    strong_indicators = [item for item in ordered if float(item["score"]) >= 70]

    constraint_keys = {
        "healthcare": "healthcare_constraint",
        "infrastructure": "infrastructure_constraint",
        "transport": "transport_constraint",
        "education": "education_constraint",
        "environment": "environment_pressure",
    }
    constraints = [
        constraint_keys.get(
            item["category"].strip().lower(),
            f"{item['category'].strip().lower()}_needs_review",
        )
        for item in low_indicators
    ]

    profile = DevelopmentProfile(
        profile_name=f"{highest['category']} strength profile",
        dominant_characteristics=[
            f"Highest observed indicator: {highest['category']} ({float(highest['score']):.1f}/100)",
            f"Lowest observed indicator: {lowest['category']} ({float(lowest['score']):.1f}/100)",
        ],
        strengths=(
            [f"{item['category']} is at least 70/100" for item in strong_indicators]
            or ["No supplied indicator reaches the 70/100 reference threshold"]
        ),
        constraints=constraints or ["No supplied indicator is below 60/100"],
        contextual_priorities=[
            f"Review {item['category']} performance"
            for item in ordered[: min(3, len(ordered))]
        ],
        evidence_indicators=[item["category"] for item in indicator_data],
        limitations=(
            "Rule-based profile derived only from supplied indicator scores; "
            "it does not verify underlying data or identify causes."
        ),
    )
    return profile.model_dump()
