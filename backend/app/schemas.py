from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    firstname: str
    lastname: str
    username: str
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_approved: Optional[bool] = None
    is_admin: Optional[bool] = None
    groups: List[int] = []  # List of group IDs
    projects: List[int] = []  # List of project IDs
    
    class Config:
        orm_mode = True

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

# Group Schema
class GroupBase(BaseModel):
    name: str


class GroupCreate(GroupBase):
    pass


class GroupUpdate(GroupBase):
    pass


class GroupResponse(GroupBase):
    id: int

    class Config:
        orm_mode = True


# Project Schema
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int

    class Config:
        orm_mode = True

# User Schema with nested groups and projects
class UsersResponse(BaseModel):
    id: int
    firstname: str
    lastname: str
    username: str
    email: str
    is_active: bool
    is_approved: bool
    groups: List[GroupBase]  # List of group details
    projects: List[ProjectBase]  # List of project details

    class Config:
        orm_mode = True