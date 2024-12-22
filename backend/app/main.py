from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .db.mongodb import connect_to_mongo, close_mongo_connection
from .api import auth, users, roles, logs, membership
from .core.middleware import error_handler_middleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Events
@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["auth"])
app.include_router(users.router, prefix=settings.API_V1_STR, tags=["users"])
app.include_router(roles.router, prefix=settings.API_V1_STR, tags=["roles"])
app.include_router(logs.router, prefix=settings.API_V1_STR, tags=["logs"])
app.include_router(membership.router, prefix="/api/admin", tags=["membership"])

@app.get("/")
async def root():
    return {"message": "Welcome to AutoVideo API"} 

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            # 处理消息
            response = {
                "id": data.get("id"),
                "type": data.get("type"),
                "data": {"success": True}
            }
            await websocket.send_json(response)
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

# 添加错误处理中间件
app.middleware("http")(error_handler_middleware)