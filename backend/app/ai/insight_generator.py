"""
AI Insight Generator.
Produces executive urban briefings, ward score explanations, and comparative policy memos.
Uses Gemini 1.5 with deterministic fallback templates if API is unreachable.
"""
import json
from typing import Optional
from sqlalchemy.orm import Session

from app.ai.gemini_client import call_gemini
from app.models.uis import AIInsight
from app.core.config import settings


async def generate_area_narrative(
    db: Session,
    area_id: int,
    area_name: str,
    area_uis: float,
    indicator_scores: list[dict],
    constraints: list[str],
) -> str:
    """
    Generate an executive qualitative explanation of an area's UIS performance.
    """
    scores_str = "\n".join([f"- {s['category']}: {s['score']:.1f}/100" for s in indicator_scores])
    constraints_str = ", ".join(constraints) if constraints else "No critical constraints detected"

    prompt = f"""You are a senior urban development advisor. Write a concise, professional 3-paragraph executive briefing for the municipal council on:

Ward: {area_name}
Overall Area UIS Score: {area_uis:.1f}/100
Constraints Identified: {constraints_str}

Indicator Breakdown:
{scores_str}

Guidelines:
1. First paragraph: Summarize overall development health and quality of life in this ward.
2. Second paragraph: Highlight the specific bottlenecks and low-scoring indicators dragging the score down.
3. Third paragraph: Recommend 1-2 high-impact interventions.
Tone: Formal, objective, municipal policy briefing. Do NOT invent raw statistics not present above."""

    content = None
    model_used = "gemini-1.5-flash"
    
    # Attempt Gemini call if API key configured
    if settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_"):
        try:
            content = await call_gemini(prompt, max_tokens=600)
        except Exception:
            content = None

    # Deterministic fallback briefing if LLM call unavailable or failed
    if not content:
        model_used = "deterministic-rule-engine"
        lowest_cat = min(indicator_scores, key=lambda x: x["score"]) if indicator_scores else {"category": "Infrastructure", "score": 50.0}
        highest_cat = max(indicator_scores, key=lambda x: x["score"]) if indicator_scores else {"category": "Education", "score": 80.0}

        content = (
            f"Ward Overview: {area_name} demonstrates an overall Urban Intelligence Score of {area_uis:.1f}/100. "
            f"The ward is characterized by strong performance in {highest_cat['category']} ({highest_cat['score']:.1f}/100), "
            f"which provides a resilient baseline for local residents.\n\n"
            f"Critical Constraints: The primary development bottleneck is observed in {lowest_cat['category']} "
            f"with an indicator score of {lowest_cat['score']:.1f}/100. Active constraints noted: {constraints_str}. "
            f"These deficiencies disproportionately impact community accessibility and day-to-day service delivery.\n\n"
            f"Policy Recommendations: Targeted municipal budget should prioritize capital enhancements in {lowest_cat['category']} "
            f"to bridge the benchmark gap, combined with spatial accessibility upgrades to ensure equitable coverage."
        )

    # Persist in AI insights table
    insight = AIInsight(
        area_id=area_id,
        insight_type="explanation",
        content=content,
        model_used=model_used,
        prompt_version="v1.0",
    )
    db.add(insight)
    db.commit()

    return content


async def generate_comparative_narrative(
    area_a_name: str,
    score_a: float,
    area_b_name: str,
    score_b: float,
    differences: list[dict],
) -> str:
    """
    Generate a comparative briefing explaining disparities between two areas.
    """
    diff_lines = [
        f"- {d['category']}: {area_a_name}={d['score_a']:.1f} vs {area_b_name}={d['score_b']:.1f} (Diff: {d['diff']:+.1f})"
        for d in differences
    ]
    diff_str = "\n".join(diff_lines)

    prompt = f"""Compare the urban development profiles of two wards:
1. {area_a_name} (UIS: {score_a:.1f}/100)
2. {area_b_name} (UIS: {score_b:.1f}/100)

Category Differences:
{diff_str}

Write a 2-paragraph comparative analysis explaining where the equity gaps lie and how municipal planners can balance resources across both wards."""

    if settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_"):
        try:
            return await call_gemini(prompt, max_tokens=500)
        except Exception:
            pass

    # Deterministic fallback
    higher_area = area_a_name if score_a >= score_b else area_b_name
    lower_area = area_b_name if score_a >= score_b else area_a_name
    diff_val = abs(score_a - score_b)

    return (
        f"Cross-Ward Equity Comparison: {higher_area} outperforms {lower_area} by a margin of {diff_val:.1f} UIS points. "
        f"The disparity is primarily driven by divergence in core infrastructural indicators. While {higher_area} benefits "
        f"from denser service networks, {lower_area} faces localized service constraints.\n\n"
        f"Strategic Allocation: To close this spatial equity gap, city planners should reallocate capital expenditure towards "
        f"the lagging indicators identified in {lower_area}, aiming to elevate baseline quality of life to parity with {higher_area}."
    )
