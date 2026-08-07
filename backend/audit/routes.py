from fastapi import APIRouter
from audit.schemas import AuditRequest, AuditResponse
from audit.engine import audit_layout

router = APIRouter()


@router.post("", response_model=AuditResponse)
@router.post("/", response_model=AuditResponse, include_in_schema=False)
async def perform_audit(payload: AuditRequest):
    result = audit_layout(
        walls=payload.walls,
        doors=payload.doors,
        windows=payload.windows,
    )
    return AuditResponse(**result)
