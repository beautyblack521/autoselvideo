from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class LogBase(BaseModel):
    user_id: Optional[str]
    action: str
    resource: str
    details: Optional[str]
    ip_address: Optional[str]
    timestamp: datetime = datetime.utcnow()

class LogCreate(LogBase):
    pass

class Log(LogBase):
    id: str 