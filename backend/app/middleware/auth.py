
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.utils import decode_jwt

class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        try:
            if credentials:
                if not credentials.scheme == "Bearer":
                    raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
                return self.verify_jwt(credentials.credentials)
            else:
                raise HTTPException(status_code=403, detail="Invalid authorization code.")
        except Exception as e:
            print(e)
        
    def verify_jwt(self, jwtoken: str) -> bool:

        try:
            payload = decode_jwt(jwtoken)
        except:
            payload = None
        if payload:
            return payload
        else:
            return {}
        
jwt_bearer = JWTBearer()