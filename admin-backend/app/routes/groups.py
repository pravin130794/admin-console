from fastapi import APIRouter, HTTPException, Query
from app.models import Group, User
from bson import ObjectId
from typing import List
from beanie import PydanticObjectId


router = APIRouter()

# Create a new group
@router.post("/groups")
async def create_group(group: Group):
    await group.create()
    return {"message": "Group created successfully", "group": group}

# Get a list of all groups
@router.get("/groups")
async def list_user_groups(
    user_id: str,  # User ID passed as a query parameter
    skip: int = Query(0, ge=0),  # Number of items to skip
    limit: int = Query(10, ge=1)  # Number of items to fetch
):
    """
    Get a paginated list of groups the user created or has been assigned to.
    If the user is a SuperAdmin, fetch all groups.
    """
    try:
        # Convert user_id to PydanticObjectId
        user_id = PydanticObjectId(user_id)

        # Fetch the user from the database
        user = await User.find_one(User.id == user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Initialize groups query
        if user.role == "SuperAdmin":
            # SuperAdmin fetches all groups
            groups_query = Group.find_all()
        else:
            # Fetch groups created by or assigned to the user
            groups_query = Group.find({
                "$or": [
                    {"createdBy": user_id},
                    {"members": {"$in": [user_id]}}
                ]
            })

        # Fetch groups with pagination
        if skip is not None and limit is not None:
            groups = await groups_query.skip(skip).limit(limit).to_list()
        else:
            groups = await groups_query.to_list()

        # Get the total count of groups (without pagination)
        total_count = await groups_query.count()

        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "groups": groups
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Get a specific group by ID
@router.get("/groups/{group_id}")
async def get_group(group_id: str):
    if not ObjectId.is_valid(group_id):
        raise HTTPException(status_code=400, detail="Invalid group ID")
    group = await Group.get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

# Update a group by ID
@router.put("/groups/{group_id}")
async def update_group(group_id: str, updated_data: Group):
    if not ObjectId.is_valid(group_id):
        raise HTTPException(status_code=400, detail="Invalid group ID")
    group = await Group.get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    updated_group = await group.set(updated_data.dict(exclude_unset=True))
    return {"message": "Group updated successfully", "group": updated_group}

# Delete a group by ID
@router.delete("/groups/{group_id}")
async def delete_group(group_id: str):
    if not ObjectId.is_valid(group_id):
        raise HTTPException(status_code=400, detail="Invalid group ID")
    group = await Group.get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    await group.delete()
    return {"message": "Group deleted successfully"}
