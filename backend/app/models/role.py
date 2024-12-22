from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class RoleBase(BaseModel):
    name: str
    permissions: List[str]
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    permissions: Optional[List[str]] = None
    description: Optional[str] = None

class Role(RoleBase):
    id: str
    created_at: datetime
    updated_at: datetime 