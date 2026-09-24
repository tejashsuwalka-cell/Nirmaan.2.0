from pydantic import BaseModel, Field
from typing import List, Optional


class Wall(BaseModel):
    id: str
    x1: float
    y1: float
    x2: float
    y2: float
    thickness: float = 14.0
    height: Optional[float] = 150.0
    color: Optional[str] = "#1e293b"


class Door(BaseModel):
    id: str
    wallId: Optional[str] = None
    x: float
    y: float
    width: float = 50.0
    swing: Optional[str] = "left"


class Window(BaseModel):
    id: str
    wallId: Optional[str] = None
    x: float
    y: float
    width: float = 70.0
    height: Optional[float] = 50.0
    sillHeight: Optional[float] = 40.0


class FurnitureItem(BaseModel):
    id: str
    type: str
    x: float
    y: float
    rotation: Optional[float] = 0.0
    scale: Optional[float] = 1.0


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Project name")
    type: Optional[str] = "Residential Design"
    walls: Optional[List[Wall]] = []
    doors: Optional[List[Door]] = []
    windows: Optional[List[Window]] = []
    furniture: Optional[List[FurnitureItem]] = []


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    walls: Optional[List[Wall]] = None
    doors: Optional[List[Door]] = None
    windows: Optional[List[Window]] = None
    furniture: Optional[List[FurnitureItem]] = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    type: Optional[str] = "Residential Design"
    owner_id: str
    walls: List[Wall] = []
    doors: List[Door] = []
    windows: List[Window] = []
    furniture: List[FurnitureItem] = []
    created_at: str
    updated_at: str
