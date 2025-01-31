from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from app.middleware.auth import JWTBearer
from app.models import Group, User, Project, InactivateGroupRequest, GroupUpdateRequest, CreateGroupRequest
from bson import ObjectId
from typing import List
from beanie import PydanticObjectId


router = APIRouter()

# Create a new group
@router.post("/groups",dependencies=[Depends(JWTBearer())])
async def create_group(group: CreateGroupRequest):
    """
    Create a new group with member associations and other details.
    Update the groupIds field in the User collection for all members.
    """
    try:
        # Check if the group already exists
        existing_group = await Group.find_one(Group.name == group.name)
        if existing_group:
            raise HTTPException(status_code=400, detail="Group already exists")

        # Validate and fetch users
        users = await User.find({"_id": {"$in": group.members}}).to_list()
        if len(users) != len(group.members):
            raise HTTPException(status_code=404, detail="Some users not found")
        
        # Prepare the new group
        new_group = Group(
            name=group.name,
            description=group.description,
            createdBy=group.createdBy,
            groupAdmin=group.groupAdmin,
            members=group.members,
            isActive=True,
            createdAt=datetime.now(),
            updatedAt=datetime.now(),
        )

        # Save the group to the database
        await new_group.create()

        # Update each user's groupIds field
        for user_id in group.members:
            user = await User.find_one({"_id": user_id})
            if user:
                user.groupIds.append(new_group.id)
                await user.save() 

        return {"message": "Group created successfully", "groupId": str(new_group.id)}

    except HTTPException as error:
        raise error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Get a list of all groups with associated project details
@router.get("/groups", dependencies=[Depends(JWTBearer())])
async def list_user_groups(
    user_id: str,  # User ID passed as a query parameter
    skip: int = Query(0, ge=0),  # Number of items to skip
    limit: int = Query(10, ge=1)  # Number of items to fetch
):
    """
    Get a paginated list of groups created by the user or where the user is a member.
    SuperAdmin can see all active groups, and groups will have associated project details.
    """
    try:
        # Convert user_id to PydanticObjectId
        user_id = PydanticObjectId(user_id)

        # Fetch the user from the database
        user = await User.find_one(User.id == user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Initialize query based on user role
        if user.role == "SuperAdmin":
            # SuperAdmin fetches all active groups
            groups_query = Group.find({"isActive": True})
        else:
            # Fetch groups created by the user or where the user is a member
            groups_query = Group.find({
                "$and": [
                    {"isActive": True},
                    {"$or": [
                        {"members": {"$in": [user_id]}},
                        {"createdBy": user_id}
                    ]}
                ]
            })

        # Apply pagination
        groups = await groups_query.skip(skip).limit(limit).to_list()

        # Get the total count of matching groups (without pagination)
        total_count = await groups_query.count()

        # Prepare the response data
        group_list = []

        for group in groups:
            # Fetch members' details for the group
            members = await User.find({"_id": {"$in": group.members}}).to_list()
            member_data = [
                {
                    "id": str(member.id),
                    "name": f"{member.username}"  # Combining first and last name
                }
                for member in members
            ]

            # Fetch projects associated with the group
            projects = await Project.find({"groupId": group.id}).to_list()
            project_data = [
                {
                    "id": str(project.id),
                    "name": project.name,
                    "description": project.description,
                    "status": project.status
                }
                for project in projects
            ]

            # Prepare the group data with project details
            group_data = {
                "id": str(group.id),
                "name": group.name,
                "description": group.description,
                "createdBy": str(group.createdBy),
                "members": member_data,  # Now members contain name and id
                "projects": project_data,  # Added project details
                "isActive": group.isActive
            }
            group_list.append(group_data)

        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "groups": group_list
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Get a specific group by ID
@router.get("/groups/{group_id}",dependencies=[Depends(JWTBearer())])
async def get_group(group_id: str):
    if not ObjectId.is_valid(group_id):
        raise HTTPException(status_code=400, detail="Invalid group ID")
    group = await Group.get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

# Update a group by ID
@router.put("/groups",dependencies=[Depends(JWTBearer())])
async def partial_update_group(group: GroupUpdateRequest):
    """
    Partially update group details and update the groupIds field in the User collection for members.
    """
    try:
        # Convert group_id to PydanticObjectId
        group_id = PydanticObjectId(group.id)

        # Check if group exists
        existing_group = await Group.find_one(Group.id == group_id)
        if not existing_group:
            raise HTTPException(status_code=404, detail="Group not found")

        # Update fields provided in the request
        if group.name is not None:
            existing_group.name = group.name
        if group.description is not None:
            existing_group.description = group.description

        # If members are updated, synchronize the User collection
        if group.members is not None:
            # Validate and fetch users
            users = await User.find({"_id": {"$in": group.members}}).to_list()
            if len(users) != len(group.members):
                raise HTTPException(status_code=404, detail="Some users not found")

            # Update the group's members
            existing_group.members = group.members

            # Update the groupIds field in User collection
            # Remove this group ID from users who are no longer members
            old_members = set(existing_group.members)
            new_members = set(group.members)
            removed_members = old_members - new_members
            added_members = new_members - old_members

            # Remove group ID from users who are no longer members
            for user_id in removed_members:
                user = await User.find_one({"_id": user_id})
                if user and group_id in user.groupIds:
                    user.groupIds.remove(group_id)
                    await user.save()

            # Add group ID to new members
            for user_id in added_members:
                user = await User.find_one({"_id": user_id})
                if user:
                    user.groupIds.append(group_id)
                    await user.save()

        # Save the group changes
        await existing_group.save()

        return {
            "message": "Group updated successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Delete a group by ID
@router.patch("/group/{group_id}/inactivate",dependencies=[Depends(JWTBearer())])
async def inactivate_group(group_id: str, request: InactivateGroupRequest):
    """
    Inactivate a group by setting isActive to False, storing the reason,
    and removing the group ID from associated users' groupIds.
    """
    try:
        # Validate and convert group_id to PydanticObjectId
        if not PydanticObjectId.is_valid(group_id):
            raise HTTPException(status_code=400, detail="Invalid group ID")
        group_id = PydanticObjectId(group_id)

        # Find the group in the database
        group = await Group.find_one(Group.id == group_id)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")

        # Update the group's status and add a reason for inactivation
        group.isActive = False
        group.reason = request.reason
        group.updatedAt = datetime.now()

        # Save the changes to the group
        await group.save()

        # Update users to remove this group ID from their groupIds field
        users_with_group = await User.find({"groupIds": group_id}).to_list()
        for user in users_with_group:
            user.groupIds.remove(group_id)  # Remove the group ID
            await user.save()  # Save the updated user document

        return {"message": "Group inactivated successfully"}

    except HTTPException as error:
        raise error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")