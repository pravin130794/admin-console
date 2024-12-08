
from datetime import datetime
import os
import jwt # type: ignore
from typing import Annotated
from app import models, database 
from sqlalchemy.orm import Session # type: ignore
from fastapi import Request, HTTPException, Depends # type: ignore
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials # type: ignore
from starlette.middleware.base import BaseHTTPMiddleware # type: ignore

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
      
class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        db = request.state.db 
        try:
            if credentials:
                if not credentials.scheme == "Bearer":
                    raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
                return self.verify_and_decode_jwt(credentials.credentials,db)
            else:
                raise HTTPException(status_code=403, detail="Invalid authorization code.")
        except Exception as e:
            print(str(e))
            raise HTTPException(status_code=403, detail=f"Error during token verification: {str(e.detail)}")


    def verify_and_decode_jwt(self, token: str,db: Session) -> dict:
            try:
                # Decode the JWT
                decoded_token = jwt.decode(
                    token,
                    os.getenv("JWT_SECRET_KEY"),
                    algorithms=[os.getenv("JWT_ALGORITHM")]
                )

                # Check for expiration
                exp = decoded_token.get("exp")
                if exp and datetime.now() > datetime.fromtimestamp(exp):
                    raise HTTPException(status_code=403, detail="Token has expired.")

                # Verify token in the database
                user_id = decoded_token.get("sub")
                token_entry = db.query(models.UserToken).filter(
                    models.UserToken.token == token,
                    models.UserToken.user_id == user_id
                ).first()
                print("token_entry",datetime.now(),token_entry.expires_at)
                if not token_entry:
                    raise HTTPException(status_code=403, detail="Token is invalid or not found in the database.")
                if datetime.now() > token_entry.expires_at:
                    raise HTTPException(status_code=403, detail="Token has expired in the database.")

                return decoded_token
            except Exception as e:
                print(str(e.detail))
                raise HTTPException(status_code=403, detail=str(e.detail))                

class DBSessionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request.state.db = next(get_db())
        response = await call_next(request)
        request.state.db.close()
        return response

jwt_bearer = JWTBearer()