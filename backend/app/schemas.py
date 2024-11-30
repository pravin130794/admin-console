from typing import List
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    firstname: str
    lastname: str
    username: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool

    class Config:
        orm_mode = True

class UserSignUpRequest(BaseModel):
    firstname: str = Field(..., min_length=2)
    lastname: str = Field(..., min_length=2)
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

    class Config:
        orm_mode = True

class UserLoginRequest(BaseModel):
    username: str
    password: str

class OTPVerify(BaseModel):
    email: str
    otp: str
    new_password: str


class GroupBase(BaseModel):
    id: int
    name: str

class ProjectBase(BaseModel):
    id: int
    name: str

class UserApprove(BaseModel):
    user_id: int
    email: str
    is_approved: bool
    groups: List[int] = []  # List of group IDs
    projects: List[int] = []  # List of project IDs