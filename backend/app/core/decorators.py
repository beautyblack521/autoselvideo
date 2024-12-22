from functools import wraps
from fastapi import HTTPException, status
from .middleware import permission

def require_permission(required_permission: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request = kwargs.get('request')
            if not request:
                for arg in args:
                    if hasattr(arg, 'scope') and arg.scope.get('type') == 'http':
                        request = arg
                        break
            
            if not await permission.check_permission(request, required_permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Permission denied"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator 