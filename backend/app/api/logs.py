from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
from ..models.log import Log
from ..core.deps import get_current_admin_user
from ..db.mongodb import get_database
from bson import ObjectId

router = APIRouter()

@router.get("/logs", response_model=List[Log])
async def read_logs(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    resource: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user = Depends(get_current_admin_user)
):
    db = await get_database()
    
    # Build query filters
    query = {}
    if user_id:
        query["user_id"] = user_id
    if action:
        query["action"] = action
    if resource:
        query["resource"] = resource
    if start_date or end_date:
        query["timestamp"] = {}
        if start_date:
            query["timestamp"]["$gte"] = start_date
        if end_date:
            query["timestamp"]["$lte"] = end_date
    
    # Execute query
    logs = await db.activity_logs.find(query).sort(
        "timestamp", -1
    ).skip(skip).limit(limit).to_list(length=limit)
    
    return logs 