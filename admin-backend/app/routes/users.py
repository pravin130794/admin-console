
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth import JWTBearer
from app.models import Group, Project, User, UserLoginRequest, UserSignUpRequest, UserToken
from bson import ObjectId
import os

from app.utils.utils import create_access_token, encrypt_password, verify_access_token, verify_password

router = APIRouter()

# Create a new user
@router.post("/users", response_model=User)
async def create_user(user: User):
    existing_user = await User.find_one(User.email == user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    if user.role == "SuperAdmin":
        user.isApproved = True
    await user.create()
    return user

# Get all users
@router.get("/users")
async def get_user_list():
    # Fetch all users
    users = await User.find_all().to_list()
    print(users)
    # Prepare the response with groups and projects details for each user
    user_list = []
    for user in users:
        # Fetch groups for the current user
        groups = await Group.find({"_id": {"$in": user.groupIds}}).to_list()

        # Fetch projects for the current user
        projects = await Project.find({"_id": {"$in": user.projectIds}}).to_list()

        user_data = {
            "id": str(user.id),
            "firstName": user.firstName,
            "lastName": user.lastName,
            "email": user.email,
            "phone": user.phone,
            "username": user.username,
            "role": user.role,
            "isActive": user.isActive,
            "isApproved": user.isApproved,
            "createdAt": user.createdAt,
            "updatedAt": user.updatedAt,
            "groups": groups,
            "projects": projects
        }
        user_list.append(user_data)
    print(user_list)
    return {"users": user_list}

# Get a single user by ID
@router.get("/users/{user_id}")
async def get_user_details(user_id: str):
    # Fetch the user document
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch groups for the user
    groups = await Group.find({"_id": {"$in": user.groupIds}}).to_list()

    enriched_groups = []
    for group in groups:
        # Fetch and serialize members
        members = await User.find({"_id": {"$in": group.members}}).to_list()
        serialized_members = [
            {
                "id": str(member.id),
                "firstName": member.firstName,
                "lastName": member.lastName,
                "email": member.email,
                "phone": member.phone,
                "username": member.username,
                "role": member.role,
                "isActive": member.isActive,
            }
            for member in members
        ]

        # Fetch and serialize projects in the group
        group_projects = await Project.find({"_id": {"$in": group.projects}}).to_list()
        serialized_projects = [
            {
                "id": str(project.id),
                "name": project.name,
                "description": project.description,
                "status": project.status,
                "groupId": str(project.groupId),
                "createdAt": project.createdAt.isoformat(),
                "updatedAt": project.updatedAt.isoformat(),
            }
            for project in group_projects
        ]

        enriched_groups.append({
            "id": str(group.id),
            "name": group.name,
            "description": group.description,
            "createdBy": str(group.createdBy),
            "groupAdmin": str(group.groupAdmin),
            "members": serialized_members,
            # "projects": serialized_projects,
            "createdAt": group.createdAt.isoformat(),
            "updatedAt": group.updatedAt.isoformat(),
        })

    # Fetch and serialize projects for the user
    projects = await Project.find({"_id": {"$in": user.projectIds}}).to_list()
    enriched_projects = [
        {
            "id": str(project.id),
            "name": project.name,
            "description": project.description,
            "status": project.status,
            "groupId": str(project.groupId),
            "assignedUsers": [
                {
                    "id": str(user.id),
                    "firstName": user.firstName,
                    "lastName": user.lastName,
                    "email": user.email,
                    "phone": user.phone,
                    "username": user.username,
                    "role": user.role,
                    "isActive": user.isActive,
                }
                for user in await User.find({"_id": {"$in": project.assignedUsers}}).to_list()
            ],
            "createdAt": project.createdAt.isoformat(),
            "updatedAt": project.updatedAt.isoformat(),
        }
        for project in projects
    ]

    # Construct the response
    return {
        "user": {
            "id": str(user.id),
            "firstName": user.firstName,
            "lastName": user.lastName,
            "email": user.email,
            "phone": user.phone,
            "username": user.username,
            "role": user.role,
            "isActive": user.isActive,
            "isApproved": user.isApproved,
            "createdAt": user.createdAt.isoformat(),
            "updatedAt": user.updatedAt.isoformat(),
        },
        "groups": enriched_groups,
        "projects": enriched_projects
    }

# Update a user by ID
@router.put("/{user_id}", response_model=User)
async def update_user(user_id: str, updated_data: User):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    updated_user = await user.set(updated_data.dict(exclude_unset=True))
    return updated_user

# Delete a user by ID
@router.delete("/{user_id}")
async def delete_user(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await user.delete()
    return {"message": "User deleted successfully"}


@router.post("/sign-up")
async def sign_up(user: UserSignUpRequest):
    # Check if username already exists
    existing_user_by_username = await User.find_one(User.username == user.username)
    if existing_user_by_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Check if email already exists
    existing_user_by_email = await User.find_one(User.email == user.email)
    if existing_user_by_email:
        raise HTTPException(status_code=400, detail="Email already in use")

    # Hash the password
    encpt_password = encrypt_password(user.password)

    # Create the new user document
    new_user = User(
        firstName=user.firstname,
        lastName=user.lastname,
        username=user.username,
        email=user.email,
        password=encpt_password,
        isActive=False,  # User is inactive until approved by admin
        groupIds=[],  # Initialize with no groups
        projectIds=[]  # Initialize with no projects
    )

    # Save the user to MongoDB
    await new_user.create()

    # Return the response
    return {"message": "User registered successfully. Pending approval from admin."}

@router.post("/login")
async def login(user: UserLoginRequest):
    # Check if the user exists in the database
    db_user = await User.find_one(User.username == user.username)
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid username")

    # Verify password
    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid password")

    # Check for an existing valid token
    valid_token = await UserToken.find_one(UserToken.user_id == str(db_user.id))
    # valid_token = await UserToken.find(
    #     And(UserToken.user_id == str(db_user.id), UserToken.expires_at > datetime.utcnow())
    # ).to_list(limit=1)

    if valid_token and valid_token.expires_at > datetime.utcnow(): # Extract the first document from the list
        return {"message": "Login successful.", "access_token": valid_token.token}

    # Generate a new JWT token
    token = create_access_token({"sub": str(db_user.id), "username": db_user.username})

    # Calculate expiration time
    expires_at = datetime.utcnow() + timedelta(minutes=int(os.getenv("JWT_EXPIRATION_MINUTES","60")))

    # Delete expired tokens for the user
    await UserToken.find(UserToken.user_id == str(db_user.id)).delete()

    # Save the new token
    user_token = UserToken(user_id=str(db_user.id), token=token, expires_at=expires_at)
    await user_token.create()

    return {"message": "Login successful.", "access_token": token}

@router.post("/logout")
async def logout(current_token: str = Depends(JWTBearer())):

    user_id = current_token.get("sub")
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid token payload")

    # Delete the token from the UserToken collection
    delete_result = await UserToken.find(UserToken.user_id == current_token['sub']).delete()

    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Token not found or already deleted")

    return {"message": "Logout successful."}