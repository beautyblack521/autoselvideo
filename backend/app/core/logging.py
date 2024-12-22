from datetime import datetime
from fastapi import Request
from ..db.mongodb import get_database
from ..models.log import LogCreate

async def log_activity(
    user_id: str,
    action: str,
    resource: str,
    details: str = None,
    request: Request = None
):
    db = await get_database()
    
    log_data = {
        "user_id": user_id,
        "action": action,
        "resource": resource,
        "details": details,
        "ip_address": request.client.host if request else None,
        "timestamp": datetime.utcnow()
    }
    
    await db.activity_logs.insert_one(log_data) 

async def log_error(error_message: str, request: Request = None):
    db = await get_database()
    
    error_log = {
        "message": error_message,
        "path": str(request.url) if request else None,
        "method": request.method if request else None,
        "timestamp": datetime.utcnow()
    }
    
    await db.error_logs.insert_one(error_log) 