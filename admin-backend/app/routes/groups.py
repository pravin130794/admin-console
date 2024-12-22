from fastapi import APIRouter, HTTPException
from app.models import Group
from bson import ObjectId
from typing import List

router = APIRouter()

# Create a new group
@router.post("/groups/")
async def create_group(group: Group):
    await group.create()
    return {"message": "Group created successfully", "group": group}

# Get a list of all groups
@router.get("/groups/")
async def list_groups():
    groups = await Group.find_all().to_list()
    return groups

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
