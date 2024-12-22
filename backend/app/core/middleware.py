from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from typing import Callable
from .logging import log_error

async def error_handler_middleware(request: Request, call_next: Callable):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        # 记录错误
        await log_error(str(e), request)
        
        # 返回错误响应
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "error": "Service temporarily unavailable",
                "detail": str(e)
            }
        ) 