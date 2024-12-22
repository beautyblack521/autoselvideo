from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List
from ..models.role import Role, RoleCreate, RoleUpdate
from ..core.deps import get_current_admin_user
from ..core.logging import log_activity
from ..db.mongodb import get_database
from bson import ObjectId

router = APIRouter()

@router.get("/roles", response_model=List[Role])
async def read_roles(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_admin_user)
):
    db = await get_database()
    roles = await db.roles.find().skip(skip).limit(limit).to_list(length=limit)
    return roles

@router.post("/roles", response_model=Role)
async def create_role(
    role_in: RoleCreate,
    request: Request,
    current_user = Depends(get_current_admin_user)
):
    db = await get_database()
    
    # Check if role name already exists
    if await db.roles.find_one({"name": role_in.name}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role name already exists"
        )
    
    role_dict = role_in.dict()
    role_dict["created_at"] = datetime.utcnow()
    role_dict["updated_at"] = role_dict["created_at"]
    
    result = await db.roles.insert_one(role_dict)
    role_dict["id"] = str(result.inserted_id)
    
    # Log activity
    await log_activity(
        user_id=str(current_user.id),
        action="create",
        resource="role",
        details=f"Created role: {role_in.name}",
        request=request
    )
    
    return role_dict

@router.put("/roles/{role_id}", response_model=Role)
async def update_role(
    role_id: str,
    role_in: RoleUpdate,
    request: Request,
    current_user = Depends(get_current_admin_user)
):
    db = await get_database()
    
    if not ObjectId.is_valid(role_id):
        raise HTTPException(status_code=400, detail="Invalid role ID")
    
    role = await db.roles.find_one({"_id": ObjectId(role_id)})
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    update_data = role_in.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.roles.update_one(
        {"_id": ObjectId(role_id)},
        {"$set": update_data}
    )
    
    # Log activity
    await log_activity(
        user_id=str(current_user.id),
        action="update",
        resource="role",
        details=f"Updated role: {role['name']}",
        request=request
    )
    
    role = await db.roles.find_one({"_id": ObjectId(role_id)})
    return role

@router.delete("/roles/{role_id}")
async def delete_role(
    role_id: str,
    request: Request,
    current_user = Depends(get_current_admin_user)
):
    db = await get_database()
    
    if not ObjectId.is_valid(role_id):
        raise HTTPException(status_code=400, detail="Invalid role ID")
    
    role = await db.roles.find_one({"_id": ObjectId(role_id)})
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Check if role is in use
    if await db.users.find_one({"role_id": ObjectId(role_id)}):
        raise HTTPException(
            status_code=400,
            detail="Cannot delete role that is assigned to users"
        )
    
    await db.roles.delete_one({"_id": ObjectId(role_id)})
    
    # Log activity
    await log_activity(
        user_id=str(current_user.id),
        action="delete",
        resource="role",
        details=f"Deleted role: {role['name']}",
        request=request
    )
    
    return {"message": "Role deleted successfully"} 