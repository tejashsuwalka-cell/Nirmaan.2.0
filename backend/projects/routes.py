import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import db
from auth.security import decode_access_token
from projects.schemas import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
)

router = APIRouter()
security_scheme = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> str:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload["sub"]


@router.get("", response_model=List[ProjectResponse])
async def list_projects(current_user_id: str = Depends(get_current_user_id)):
    cursor = db.projects.find({"owner_id": current_user_id})
    projects = await cursor.to_list(length=None)
    return [ProjectResponse(**p) for p in projects]


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project: ProjectCreate,
    current_user_id: str = Depends(get_current_user_id),
):
    project_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    walls_data = [w.model_dump() for w in project.walls] if project.walls else []
    doors_data = [d.model_dump() for d in project.doors] if project.doors else []
    windows_data = [w.model_dump() for w in project.windows] if project.windows else []
    furniture_data = [f.model_dump() for f in project.furniture] if project.furniture else []

    project_doc = {
        "_id": project_id,
        "id": project_id,
        "name": project.name,
        "type": project.type or "Residential Design",
        "owner_id": current_user_id,
        "walls": walls_data,
        "doors": doors_data,
        "windows": windows_data,
        "furniture": furniture_data,
        "created_at": now,
        "updated_at": now,
    }

    await db.projects.insert_one(project_doc)
    return ProjectResponse(**project_doc)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    proj = await db.projects.find_one(
        {"$or": [{"id": project_id}, {"_id": project_id}]}
    )
    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    if proj.get("owner_id") != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this project",
        )

    return ProjectResponse(**proj)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    current_user_id: str = Depends(get_current_user_id),
):
    proj = await db.projects.find_one(
        {"$or": [{"id": project_id}, {"_id": project_id}]}
    )
    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    if proj.get("owner_id") != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this project",
        )

    update_fields = {}
    if project_update.name is not None:
        update_fields["name"] = project_update.name
    if project_update.type is not None:
        update_fields["type"] = project_update.type
    if project_update.walls is not None:
        update_fields["walls"] = [w.model_dump() for w in project_update.walls]
    if project_update.doors is not None:
        update_fields["doors"] = [d.model_dump() for d in project_update.doors]
    if project_update.windows is not None:
        update_fields["windows"] = [w.model_dump() for w in project_update.windows]
    if project_update.furniture is not None:
        update_fields["furniture"] = [f.model_dump() for f in project_update.furniture]

    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.projects.update_one(
        {"$or": [{"id": project_id}, {"_id": project_id}], "owner_id": current_user_id},
        {"$set": update_fields},
    )

    updated_proj = await db.projects.find_one(
        {"$or": [{"id": project_id}, {"_id": project_id}], "owner_id": current_user_id}
    )
    if not updated_proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return ProjectResponse(**updated_proj)


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    proj = await db.projects.find_one(
        {"$or": [{"id": project_id}, {"_id": project_id}]}
    )
    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    if proj.get("owner_id") != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this project",
        )

    await db.projects.delete_one(
        {"$or": [{"id": project_id}, {"_id": project_id}], "owner_id": current_user_id}
    )
    return {"message": "Project deleted successfully"}
