from pydantic import BaseModel, model_validator
from typing import List, Optional, Any


class AuditRequest(BaseModel):
    walls: Optional[List[Any]] = []
    doors: Optional[List[Any]] = []
    windows: Optional[List[Any]] = []

    @model_validator(mode="before")
    @classmethod
    def extract_layout(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "layout" in data and isinstance(data["layout"], dict):
                inner = data["layout"]
                if "walls" not in data or data["walls"] is None:
                    data["walls"] = inner.get("walls", [])
                if "doors" not in data or data["doors"] is None:
                    data["doors"] = inner.get("doors", [])
                if "windows" not in data or data["windows"] is None:
                    data["windows"] = inner.get("windows", [])
        return data


class AuditResponse(BaseModel):
    score: int
    warnings: List[str] = []
    suggestions: List[str] = []
    tips: List[str] = []
    disclaimer: str
    passed: Optional[bool] = None

