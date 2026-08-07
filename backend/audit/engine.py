from typing import List, Dict, Any, Optional

DEFAULT_DISCLAIMER = (
    "Automated audit rules provide general guidance and are not a substitute for "
    "professional architectural or building code compliance review."
)

DEFAULT_TIPS = [
    "Ensure door swing paths remain unobstructed by nearby walls or furniture.",
    "Place windows on exterior walls to maximize natural sunlight and ventilation.",
    "Maintain standard corridor and entryway clearances for accessible movement."
]


def audit_layout(
    walls: Optional[List[Any]] = None,
    doors: Optional[List[Any]] = None,
    windows: Optional[List[Any]] = None,
) -> Dict[str, Any]:
    """
    Pure rule-based scoring engine for layout auditing.
    Zero I/O, zero external dependencies.

    Scoring & Rules:
    - Empty layout: Score = 0, empty layout warning & suggestions
    - Base score: 100
    - Walls < 4: -25 points & warning
    - Doors == 0: -25 points & warning
    - Windows == 0: -15 points & warning/suggestion
    - Windows > 0: Positive suggestion for natural light
    - Score bounds clamping: Strictly [0, 100]
    """
    walls_list = walls if walls is not None else []
    doors_list = doors if doors is not None else []
    windows_list = windows if windows is not None else []

    warnings: List[str] = []
    suggestions: List[str] = []
    tips: List[str] = list(DEFAULT_TIPS)
    disclaimer: str = DEFAULT_DISCLAIMER

    # Rule 0: Empty layout check
    if len(walls_list) == 0 and len(doors_list) == 0 and len(windows_list) == 0:
        return {
            "score": 0,
            "warnings": ["Empty layout: No walls, doors, or windows provided in the layout."],
            "suggestions": ["Start by drawing perimeter walls to enclose your floor plan."],
            "tips": tips,
            "disclaimer": disclaimer,
            "passed": False,
        }

    score = 100

    # Rule 1: Structural enclosure rule (minimum 4 walls)
    if len(walls_list) < 4:
        score -= 25
        if len(walls_list) == 0:
            warnings.append("No walls found: Layout requires at least 4 perimeter walls.")
        else:
            warnings.append(f"Incomplete enclosure: Layout has only {len(walls_list)} wall(s), minimum 4 required.")
        suggestions.append("Add perimeter walls to form a fully enclosed room structure.")

    # Rule 2: Accessibility rule (at least 1 door)
    if len(doors_list) == 0:
        score -= 25
        warnings.append("No access point: Layout requires at least 1 door.")
        suggestions.append("Place at least one entry door along a wall.")

    # Rule 3 & 4: Natural light / ventilation rule
    if len(windows_list) == 0:
        score -= 15
        warnings.append("No natural light: Layout has no windows.")
        suggestions.append("Consider adding at least 1 window for ventilation and natural light.")
    else:
        suggestions.append(f"Good natural lighting: Layout contains {len(windows_list)} window(s).")

    # Clamping score strictly between 0 and 100 bounds
    clamped_score = max(0, min(100, score))
    passed = clamped_score >= 70 and len(warnings) == 0

    return {
        "score": clamped_score,
        "warnings": warnings,
        "suggestions": suggestions,
        "tips": tips,
        "disclaimer": disclaimer,
        "passed": passed,
    }

