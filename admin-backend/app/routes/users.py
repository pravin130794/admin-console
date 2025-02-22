
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from app.middleware.auth import JWTBearer
from app.models import Group, Project, User,UserOTP,  UserLoginRequest, UserSignUpRequest, UserToken, SuperUserCreate, UserResponse, OTPVerify, UserApprove, RejectUserRequest, UserUpdateRequest, InactivateUserRequest, CreateUserRequest 
from bson import ObjectId
from beanie import PydanticObjectId
import os

from app.utils.utils import create_access_token, encrypt_password, verify_access_token, verify_password, generate_otp, send_otp_email

router = APIRouter()


@router.post("/superuser", response_model=UserResponse)
async def create_superuser(user: SuperUserCreate):
    try:
        # Check if a superuser already exists
        existing_user = await User.find_one({"username": user.username})
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Super User already exists"
            )

        # Hash the password
        encpt_password = encrypt_password(user.password)

        # Create a new superuser instance
        new_superuser = User(
            firstName=user.firstname,
            lastName=user.lastname,
            username=user.username,
            email=user.email,
            password=encpt_password,
            role="SuperAdmin",
            isActive=True,
            isApproved=True,
            status="Approved"
        )

        # Save the superuser to the database
        await new_superuser.insert()

        return UserResponse(
            id=str(new_superuser.id),
            firstname=new_superuser.firstName,
            lastname=new_superuser.lastName,
            username=new_superuser.username,
            email=new_superuser.email,
            is_active=new_superuser.isActive,
            is_approved=new_superuser.isApproved
        )

    except HTTPException as error:
        raise error
    except Exception as e:
        # Log unexpected errors
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

# Create a new user
@router.post("/users",dependencies=[Depends(JWTBearer())])
async def create_user(user: CreateUserRequest):
    """
    Create a new user with group associations and other details.
    Update the members field in the Group collection for associated groups.
    """
    try:
        # Check if the email already exists
        existing_user = await User.find_one(User.email == user.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already exists")

        # Validate and fetch groups
        groups = await Group.find({"_id": {"$in": user.groups}}).to_list()
        if len(groups) != len(user.groups):
            raise HTTPException(status_code=404, detail="Some groups not found")

        # Encrypt the password
        encpt_password = encrypt_password(user.password)

        # Prepare the new user
        new_user = User(
            firstName=user.firstName,
            lastName=user.lastName,
            email=user.email,
            phone=user.phone,
            username=user.username,
            password=encpt_password,
            role=user.role,
            groupIds=user.groups,
            businessPurpose=user.businessPurpose,
            isApproved=True if user.role == "SuperAdmin" else False,
            isActive=True,
            status="Approved",
            createdAt=datetime.now(),
            updatedAt=datetime.now(),
        )

        # Save the user to the database
        await new_user.create()

        # Update the members field in the associated groups
        for group_id in user.groups:
            group = await Group.find_one({"_id": group_id})
            if group and new_user.id not in group.members:
                group.members.append(new_user.id)  # Add the new user's ID to the group
                await group.save()

        return {"message": "User created successfully", "userId": str(new_user.id)}

    except HTTPException as error:
        raise error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@router.get("/users", dependencies=[Depends(JWTBearer())])
async def get_user_list(
    user_id: str,  # Pass user_id as a query parameter
    skip: int = Query(0, ge=0),  # Pagination: Number of items to skip
    limit: int = Query(10, ge=1)  # Pagination: Number of items to fetch
):
    """
    Get a paginated list of active users based on the provided user_id's role.
    - SuperAdmin: See all active users.
    - GroupAdmin: See active users in groups they manage.
    - Regular User: See active users in the same groups.
    """
    try:
        # Convert user_id to PydanticObjectId
        user_id = PydanticObjectId(user_id)

        # Fetch the current user from the database
        current_user = await User.find_one(User.id == user_id)
        if not current_user:
            raise HTTPException(status_code=404, detail="User not found")

        user_list = []

        # SuperAdmin: Fetch all active users
        if current_user.role == "SuperAdmin":
            users = await User.find({"isActive": True}).skip(skip).limit(limit).to_list()

        # GroupAdmin: Fetch active users in groups managed by the admin
        elif current_user.role == "GroupAdmin":
            group_ids = current_user.groupIds
            if not group_ids:
                raise HTTPException(status_code=403, detail="No groups assigned to the GroupAdmin.")
            users = await User.find({"groupIds": {"$in": group_ids}, "isActive": True}).skip(skip).limit(limit).to_list()

        # Regular User: Fetch active users in the same groups
        else:
            group_ids = current_user.groupIds
            if not group_ids:
                raise HTTPException(status_code=403, detail="No groups associated with the user.")
            users = await User.find({"groupIds": {"$in": group_ids}, "isActive": True}).skip(skip).limit(limit).to_list()

        # Prepare the user list response
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
                "status": user.status,
                "businessPurpose": user.businessPurpose,
                "isActive": user.isActive,
                "isApproved": user.isApproved,
                "createdAt": user.createdAt,
                "updatedAt": user.updatedAt,
                "groups": groups,
                "projects": projects,
            }
            user_list.append(user_data)

        # Calculate total active users for pagination context
        total_users = (
            await User.find({"isActive": True}).count()
            if current_user.role == "SuperAdmin"
            else await User.find({"groupIds": {"$in": current_user.groupIds}, "isActive": True}).count()
        )

        return {
            "total": total_users,
            "skip": skip,
            "limit": limit,
            "users": user_list,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Get a single user by ID
@router.get("/users/{user_id}", dependencies=[Depends(JWTBearer())])
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

# Delete a user by ID
@router.patch("/user/{user_id}/inactivate", dependencies=[Depends(JWTBearer())])
async def inactivate_user(user_id: str, request: InactivateUserRequest):
    """
    Inactivate a user by setting isActive to False, storing the reason,
    and removing the user ID from the members field of associated groups.
    """
    try:
        # Validate and convert user_id to PydanticObjectId
        if not PydanticObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        user_id = PydanticObjectId(user_id)

        # Find the user in the database
        user = await User.find_one(User.id == user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update the user's status and add a reason for inactivation
        user.isActive = False
        user.reason = request.reason
        user.updatedAt = datetime.now()

        # Save the changes to the user
        await user.save()

        # Update groups to remove this user ID from their members field
        groups_with_user = await Group.find({"members": user_id}).to_list()
        for group in groups_with_user:
            group.members.remove(user_id)  # Remove the user ID
            await group.save()  # Save the updated group document

        return {"message": "User inactivated successfully"}

    except HTTPException as error:
        raise error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@router.put("/users", dependencies=[Depends(JWTBearer())])
async def partial_update_user(user: UserUpdateRequest):
    """
    Partially update user details and update the members field in associated groups.
    """
    try:
        # Convert user_id to PydanticObjectId
        user_id = PydanticObjectId(user.id)

        # Check if user exists
        existing_user = await User.find_one(User.id == user_id)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update fields provided in the request
        if user.firstname is not None:
            existing_user.firstName = user.firstname
        if user.lastname is not None:
            existing_user.lastName = user.lastname
        if user.email is not None:
            existing_user.email = user.email
        if user.phone is not None:
            existing_user.phone = user.phone
        if user.businessPurpose is not None:
            existing_user.businessPurpose = user.businessPurpose

        # Update user groups if provided
        if user.groups is not None:
            # Validate and fetch groups
            groups = await Group.find({"_id": {"$in": user.groups}}).to_list()
            if len(groups) != len(user.groups):
                raise HTTPException(status_code=404, detail="Some groups not found")

            # Synchronize the user's groupIds
            old_groups = set(existing_user.groupIds)
            new_groups = set(user.groups)
            removed_groups = old_groups - new_groups
            added_groups = new_groups - old_groups

            # Remove user from groups they are no longer part of
            for group_id in removed_groups:
                group = await Group.find_one({"_id": group_id})
                if group and user_id in group.members:
                    group.members.remove(user_id)
                    await group.save()

            # Add user to new groups
            for group_id in added_groups:
                group = await Group.find_one({"_id": group_id})
                if group and user_id not in group.members:
                    group.members.append(user_id)
                    await group.save()

            # Update the user's groupIds field
            existing_user.groupIds = list(new_groups)

        # Update user projects if provided
        if user.projects is not None:
            projects = await Project.find({"_id": {"$in": user.projects}}).to_list()
            if len(projects) != len(user.projects):
                raise HTTPException(status_code=404, detail="Some projects not found")
            existing_user.projectIds = [project.id for project in projects]

        # Save the updated user
        await existing_user.save()

        return {
            "message": "User updated successfully"
        }

    except HTTPException as error:
        raise error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

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
    if user.password:
        encpt_password = encrypt_password(user.password)
    else:
        encpt_password = None

    # Create the new user document
    new_user = User(
        firstName=user.firstname,
        lastName=user.lastname,
        username=user.username,
        email=user.email,
        password=encpt_password,
        phone=user.phone,
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
    #     And(UserToken.user_id == str(db_user.id), UserToken.expires_at > datetime.now())
    # ).to_list(limit=1)

    if valid_token and valid_token.expires_at > datetime.now(): # Extract the first document from the list
        return {"message": "Login successful.", "access_token": valid_token.token, "user_id":str(db_user.id),"role":db_user.role,"username":db_user.username}

    # Generate a new JWT token
    token = create_access_token({"sub": str(db_user.id), "username": db_user.username})

    # Calculate expiration time
    expires_at = datetime.now() + timedelta(minutes=int(os.getenv("JWT_EXPIRATION_MINUTES","60")))

    # Delete expired tokens for the user
    await UserToken.find(UserToken.user_id == str(db_user.id)).delete()

    # Save the new token
    user_token = UserToken(user_id=str(db_user.id), token=token, expires_at=expires_at)
    await user_token.create()

    return {"message": "Login successful.", "access_token": token,"user_id":str(db_user.id),"role":db_user.role,"username":db_user.username}

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

@router.post("/verify-otp")
async def verify_otp(otp_data: OTPVerify):
    try:
        # Find the user by email
        user = await User.find_one(User.email == otp_data.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Find the OTP record for the user
        otp_record = await UserOTP.find_one(UserOTP.user_id == user.id)
        if not otp_record:
            raise HTTPException(status_code=400, detail="OTP not found or expired")

        # Check if the OTP matches
        if otp_record.otp != otp_data.otp:
            raise HTTPException(status_code=400, detail="Invalid OTP")

        # Check if the OTP is expired
        if datetime.now() > otp_record.expiration_time:
            raise HTTPException(status_code=400, detail="OTP has expired")

        # Update the user's password
        user.password = encrypt_password(otp_data.password)
        await user.save()

        # Delete the OTP record after successful verification
        await otp_record.delete()

        return {"message": "OTP verified. Your password has been updated. Login to the system"}
    except HTTPException as error:
        raise error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@router.post("/approve_user", dependencies=[Depends(JWTBearer())])
async def approve_user(request: UserApprove):
    try:
        # Find the approver user
        approver_user = await User.find_one(User.id == request.approver_user_id)
        if not approver_user:
            raise HTTPException(status_code=404, detail="Approver user not found")

        # Check if the approver is an admin
        if not approver_user.role == 'SuperAdmin':
            raise HTTPException(status_code=403, detail="Only Super Admins can approve users")

        # Find the user to be approved
        user = await User.find_one(User.id == request.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.isApproved:
            raise HTTPException(status_code=403, detail="User is already approved by Admin. Please login to the system.")

        # Approve the user
        user.isApproved = True
        user.isActive = True
        user.status = 'Approved'
        user.role = request.role


        # Assign the user to the specified groups
        groups = await Group.find({"_id": {"$in": request.groups}}).to_list()
        if len(groups) != len(request.groups):
            raise HTTPException(status_code=404, detail="Some groups not found")
        user.groupIds.extend([group.id for group in groups])

        # Assign the user to the specified projects
        projects = await Project.find({"_id": {"$in": request.projects}}).to_list()
        if len(projects) != len(request.projects):
            raise HTTPException(status_code=404, detail="Some projects not found")
        user.projectIds.extend([project.id for project in projects])

        # Save the changes to the user
        await user.save()

        # Update the members field in the associated groups
        for group_id in request.groups:
            group = await Group.find_one({"_id": group_id})
            if group and user.id not in group.members:
                group.members.append(user.id)  # Add the new user's ID to the group
                await group.save()

        # Generate and send an OTP to the user's email
        otp = await store_or_refresh_otp(user.id)
        await send_otp_email(request.email, otp)

        return {"message": "User approved, groups and projects assigned, and OTP sent for password reset"}
        
    except HTTPException as error:
        raise error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@router.post("/reject_user", dependencies=[Depends(JWTBearer())])
async def reject_user(request: RejectUserRequest):
    """
    Reject a user by setting their status to 'Rejected' and updating the rejection reason.
    """
    try:
        # Convert user_id to PydanticObjectId
        user_id = request.user_id

        # Find the user by ID
        user = await User.find_one(User.id == user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update the user's status and rejection reason
        user.status = "Rejected"
        user.reason = request.reason
        user.updatedAt = datetime.now()

        # Save the changes
        await user.save()

        return {"message": f"User with ID {user_id} has been rejected successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Function to store OTP and expiration time in the database
async def store_or_refresh_otp(user_id: PydanticObjectId) -> str:
    """
    Store or refresh an OTP for a user in the database.
    If an existing OTP is still valid, it will be reused.
    Otherwise, a new OTP will be generated and stored.
    """
    current_time = datetime.now()

    # Find the existing OTP record for the user
    otp_record = await UserOTP.find_one(UserOTP.user_id == user_id)
    # otp_record = await UserOTP.find_one({"user_id": user_id})
    if otp_record:
        # Check if the existing OTP has expired
        if otp_record.expiration_time > current_time:
            return otp_record.otp  # Return existing OTP if still valid

        # Update the OTP and expiration time if expired
        otp_record.otp = generate_otp()
        otp_record.expiration_time = current_time + timedelta(minutes=5)
        await otp_record.save()
        return otp_record.otp

    else:
        # Create a new OTP record if none exists
        otp = generate_otp()
        expiration_time = current_time + timedelta(minutes=5)
        new_otp_record = UserOTP(
            user_id=user_id,
            otp=otp,
            expiration_time=expiration_time
        )
        await new_otp_record.insert()
        return new_otp_record.otp
    
@router.get("/verify-token")
async def verify_token(token: str):
    """
    Verify a token by checking its expiry date from the database.
    Returns success if the token is valid; otherwise, returns an error.
    """
    try:
        # Find the token in the database
        token_record = await UserToken.find_one({"token": token})
        if not token_record:
            raise HTTPException(status_code=404, detail="Token not found")

        # Check if the token is expired
        current_time = datetime.now()
        if token_record.expires_at < current_time:
            raise HTTPException(status_code=401, detail="Token has expired")

        # If valid, return success
        return {"message": "Token is valid", "expires_at": token_record.expires_at.isoformat()}

    except HTTPException as error:
        raise error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")