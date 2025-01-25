from fastapi import APIRouter, Depends, HTTPException, Query
from app.middleware.auth import JWTBearer
from app.models import Host, User, Project, CreateHostRequest, HostUpdateRequest, InactivateHostRequest
from beanie import PydanticObjectId
from bson import ObjectId
from typing import List
from datetime import datetime

router = APIRouter()

# Create a new host
@router.post("/hosts",dependencies=[Depends(JWTBearer())])
async def create_host(host: CreateHostRequest):
    """
    Create a new host with member associations and other details.
    """
    try:
        # Check if the host already exists
        existing_host = await Host.find_one(Host.name == host.name)
        if existing_host:
            raise HTTPException(status_code=400, detail="Host already exists")
        
        # Prepare the new host
        new_host = Host(
            name=host.name,
            description=host.description,
            projectId=host.projectId,
            isActive=True,
            createdAt=datetime.now(),
            updatedAt=datetime.now(),
        )

        # Save the host to the database
        await new_host.create()

        return {"message": "Host created successfully", "hostId": str(new_host.id)}

    except HTTPException as error:
        raise error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Get a list of all hosts
@router.get("/hosts",dependencies=[Depends(JWTBearer())])
async def list_user_hosts(
    user_id: str,  # User ID passed as a query parameter
    skip: int = Query(0, ge=0),  # Number of items to skip
    limit: int = Query(10, ge=1)  # Number of items to fetch
):
    """
    Get a paginated list of hosts created by the user or where the user is a member.
    SuperAdmin can see all active hosts.
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
            # SuperAdmin fetches all active hosts
            hosts_query = Host.find({"isActive": True})
        else:
            # Fetch hosts created by the user or where the user is a member
            hosts_query = Host.find({
                "$and": [
                    {"isActive": True},
                ]
            })

        # Apply pagination
        hosts = await hosts_query.skip(skip).limit(limit).to_list()

        # Get the total count of matching hosts (without pagination)
        total_count = await hosts_query.count()

        # Prepare the response data
        host_list = []

        for host in hosts:
            # Fetch the project data for the host
            project = await Project.find_one(Project.id == host.projectId)


            # Prepare the project name and assigned user names
            project_name = project.name if project else "Unknown"

            host_data = {
                "id": str(host.id),
                "name": host.name,
                "description": host.description,
                "projectId": str(host.projectId),
                "projectName": project_name,
                "isActive": host.isActive
            }

            host_list.append(host_data)

        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "hosts": host_list
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Get a specific host by ID
@router.get("/hosts/{host_id}", dependencies=[Depends(JWTBearer())])
async def get_host(host_id: str):
    if not ObjectId.is_valid(host_id):
        raise HTTPException(status_code=400, detail="Invalid host ID")
    host = await Host.get(host_id)
    if not host:
        raise HTTPException(status_code=404, detail="Host not found")
    return host

# Update a host by ID
@router.put("/hosts",dependencies=[Depends(JWTBearer())])
async def partial_update_host(host: HostUpdateRequest):
    """
    Partially update host details.
    """
    try:
        # Convert host_id to PydanticObjectId
        host_id = PydanticObjectId(host.id)

        # Check if host exists
        existing_host = await Host.find_one(Host.id == host_id)
        if not existing_host:
            raise HTTPException(status_code=404, detail="Host not found")

        # Update fields provided in the request
        if host.name is not None:
            existing_host.name = host.name
        if host.description is not None:
            existing_host.description = host.description
        if host.projectId is not None:
            existing_host.projectId = host.projectId

        # Save the group changes
        await existing_host.save()

        return {
            "message": "Host updated successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# Delete a host by ID
@router.patch("/host/{host_id}/inactivate",dependencies=[Depends(JWTBearer())])
async def inactivate_host(host_id: str, request: InactivateHostRequest):
    """
    Inactivate a host by setting isActive to False, storing the reason,
    and removing the host ID from associated users' hostIds.
    """
    try:
        # Validate and convert host_id to PydanticObjectId
        if not PydanticObjectId.is_valid(host_id):
            raise HTTPException(status_code=400, detail="Invalid host ID")
        host_id = PydanticObjectId(host_id)

        # Find the host in the database
        host = await Host.find_one(Host.id == host_id)
        if not host:
            raise HTTPException(status_code=404, detail="Host not found")

        # Update the host's status and add a reason for inactivation
        host.isActive = False
        host.reason = request.reason
        host.updatedAt = datetime.now()

        # Save the changes to the host
        await host.save()

        return {"message": "Host inactivated successfully"}

    except HTTPException as error:
        raise error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
