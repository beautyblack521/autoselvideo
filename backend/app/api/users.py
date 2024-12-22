from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..models.user import User, UserCreate, UserUpdate
from ..core.security import get_current_user, get_current_admin_user
from ..db.mongodb import get_database
from bson import ObjectId
from ..core.decorators import require_permission

router = APIRouter()

@router.get("/users/me", response_model=User)
async def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/users", response_model=List[User])
@require_permission("view_users")
async def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    db = await get_database()
    users = await db.users.find().skip(skip).limit(limit).to_list(length=limit)
    return [User(**user) for user in users]

@router.post("/users", response_model=User)
async def create_user(
    user_in: UserCreate,
    current_user: User = Depends(get_current_admin_user)
):
    db = await get_database()
    
    if await db.users.find_one({"email": user_in.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_dict = user_in.dict()
    hashed_password = get_password_hash(user_dict.pop("password"))
    user_dict["hashed_password"] = hashed_password
    
    result = await db.users.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    
    return user_dict

@router.put("/users/{user_id}", response_model=User)
async def update_user(
    user_id: str,
    user_in: UserUpdate,
    current_user: User = Depends(get_current_admin_user)
):
    db = await get_database()
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_in.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    return User(**user)

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    db = await get_database()
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"} 