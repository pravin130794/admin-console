from datetime import datetime
from typing import Dict
import os
import jwt
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from app.models import UserToken  # Import your Beanie model
from app.database import init_db  # Ensure database initialization

class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        try:
            if credentials:
                if not credentials.scheme == "Bearer":
                    raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
                return await self.verify_and_decode_jwt(credentials.credentials)
            else:
                raise HTTPException(status_code=403, detail="Invalid authorization code.")
        except Exception as e:
            if hasattr(e, 'detail'):
                print(e.detail)
                raise HTTPException(status_code=403, detail=f"Error during token verification: {e.detail}")
            else:
                print(e)
                raise HTTPException(status_code=403, detail=f"Error during token verification: {e}")

    async def verify_and_decode_jwt(self, token: str) -> Dict:
        try:
            # Decode the JWT
            decoded_token = jwt.decode(
                token,
                os.getenv("JWT_SECRET_KEY","20da24faf6b542d34131de1a27fc72806df274dfec9ae87ea70502274fb203c1"),
                algorithms=[os.getenv("JWT_ALGORITHM","HS256")]
            )
            # Verify token in the database
            user_id = decoded_token.get("sub")
            token_entry = await UserToken.find_one({"token": token, "user_id": user_id})

            if not token_entry:
                raise HTTPException(status_code=403, detail="Token is invalid or not found in the database.")

            # Check for expiration
            if datetime.now() > token_entry.expires_at:
                raise HTTPException(status_code=403, detail="Token has expired.")

            return decoded_token
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=403, detail="Token has expired.")
        # except jwt.InvalidTokenError:
        #     raise HTTPException(status_code=403, detail="Invalid token.")
        except Exception as e:
            if hasattr(e, 'detail'):
                print(e.detail)
                raise HTTPException(status_code=403, detail=str(e.detail)) 
            else:
                print(e)
                raise HTTPException(status_code=403, detail=str(e)) 


class DBSessionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Initialize database for the request
        await init_db()
        response = await call_next(request)
        return response


jwt_bearer = JWTBearer()
