from beanie import Document, PydanticObjectId
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional

# Permission Model
class PermissionModel(BaseModel):
    createPermission: bool = False
    updatePermission: bool = False
    deletePermission: bool = False

# Group Assignment Model
class GroupAssignmentModel(BaseModel):
    groupId: PydanticObjectId  # Use PydanticObjectId
    role: str
    permissions: PermissionModel

# Project Assignment Model
class ProjectAssignmentModel(BaseModel):
    projectId: PydanticObjectId  # Use PydanticObjectId
    role: str
    permissions: PermissionModel

# Input schema for Superuser creation
class SuperUserCreate(BaseModel):
    firstname: str
    lastname: str
    username: str
    email: EmailStr
    password: str

# Response schema
class UserResponse(BaseModel):
    id: str
    firstname: str
    lastname: str
    username: str
    email: EmailStr
    is_active: bool
    is_approved: bool

# User Model
class User(Document):
    firstName: str
    lastName: str
    email: EmailStr
    phone: Optional[str] = None
    username: str
    password: Optional[str] = None
    role: str = Field(default="User", enum=["SuperAdmin", "GroupAdmin", "User"])
    groupIds: List[PydanticObjectId]  = [] # Store only group IDs
    projectIds: List[PydanticObjectId] = [] 
    businessPurpose: Optional[str] = None  # Optional field
    isActive: bool = True
    isApproved: bool = False
    reason: Optional[str] = None  # Optional field
    status: str = Field(default="Pending", enum=["Approved", "Rejected", "Pending"])
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"  # Collection name in MongoDB

# Group Member Model
class GroupMemberModel(BaseModel):
    userId: PydanticObjectId
    role: str = Field(default="User", enum=["SuperAdmin", "GroupAdmin", "User"])
    permissions: PermissionModel

# Group Model
class Group(Document):
    name: str
    description: str
    createdBy: PydanticObjectId
    groupAdmin: PydanticObjectId
    members: List[PydanticObjectId] = []
    projects: List[PydanticObjectId] = []  # List of project IDs
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "groups"

# Project Member Model
class ProjectMemberModel(BaseModel):
    userId: PydanticObjectId
    role: str = Field(default="Member", enum=["Manager", "Member"])
    permissions: PermissionModel

# Project Model
class Project(Document):
    name: str
    description: str
    status: str = Field(default="Not Started", enum=["Not Started", "In Progress", "Completed"])
    groupId: PydanticObjectId  # Reference to the parent Group
    assignedUsers: List[PydanticObjectId] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "projects"


class UserSignUpRequest(BaseModel):
    firstname: str
    lastname: str
    username: str
    email: EmailStr
    password: Optional[str] = None

class UserToken(Document):
    user_id: str  # Reference to the User ID
    token: str  # JWT token
    expires_at: datetime  # Expiration time

    class Settings:
        name = "user_tokens"

class UserLoginRequest(BaseModel):
    username: str
    password: str

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str
    password: str

class UserOTP(Document):
    user_id: PydanticObjectId
    otp: str
    expiration_time: datetime

    class Settings:
        name = "user_otps"

# Request schema for approving a user
class UserApprove(BaseModel):
    approver_user_id: PydanticObjectId
    user_id: PydanticObjectId
    groups: List[PydanticObjectId]  # List of group IDs
    projects: List[PydanticObjectId]  # List of project IDs
    email: EmailStr
    role: str

class RejectUserRequest(BaseModel):
    user_id: PydanticObjectId
    reason: str

class UserUpdateRequest(BaseModel):
    id: PydanticObjectId
    reason: Optional[str] = None
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    businessPurpose: Optional[str] = None
    groups: List[PydanticObjectId]= []  # List of group IDs
    projects: List[PydanticObjectId]= []  # List of project IDs
    
# Request schema for deactivating a user
class InactivateUserRequest(BaseModel):
    reason: Optional[str] = None  # Reason for inactivation

# Request schema for creating a user
class CreateUserRequest(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    username: str
    password: str
    role: str  # Role of the user (e.g., "SuperAdmin", "GroupAdmin", "User")
    groups: List[PydanticObjectId] = [] # List of group IDs to assign to the user
    businessPurpose: str