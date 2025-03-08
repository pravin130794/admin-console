from fastapi import APIRouter, Depends, HTTPException, Query
from app.middleware.auth import JWTBearer
from app.models import Host, User, Project,Devices, Group,  CreateHostRequest, HostUpdateRequest, InactivateHostRequest
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
            member=host.member,
            project=host.project,
            group=host.group,
            devices=host.devices,
            os=host.os,
            ipAddress=host.ipAddress,
            location=host.location,
            reason=None,
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

@router.get("/hosts", dependencies=[Depends(JWTBearer())])
async def list_user_hosts(
    user_id: str,  # User ID passed as a query parameter
    skip: int = Query(0, ge=0),  # Number of items to skip
    limit: int = Query(10, ge=1)  # Number of items to fetch
):
    """
    Get a paginated list of active hosts based on the user's role.
    
    - SuperAdmin: Sees all active hosts.
    - GroupAdmin: Sees active hosts in the groups they manage.
    - Regular User: (Assumed) Sees active hosts in the groups they belong to.
    """
    try:
        # Convert user_id to PydanticObjectId
        user_id = PydanticObjectId(user_id)

        # Fetch the user from the database
        user = await User.find_one(User.id == user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Initialize the query based on user role
        if user.role == "SuperAdmin":
            # SuperAdmin fetches all active hosts
            hosts_query = Host.find({"isActive": True})
        elif user.role == "GroupAdmin":
            # GroupAdmin sees hosts in groups they manage.
            # In your relation, GroupAdmin U1 manages groups ['G1', 'G2']
            hosts_query = Host.find({
                "$and": [
                    {"isActive": True},
                    {"group": {"$in": user.groupIds}}
                ]
            })
        else:
            # Regular user: See hosts in groups they belong to.
            # This assumes that regular users have a field like `groups` as well.
            hosts_query = Host.find({
                "$and": [
                    {"isActive": True},
                    {"group": {"$in": user.groupIds}}
                ]
            })

        # Apply pagination
        hosts = await hosts_query.skip(skip).limit(limit).to_list()

        # Get the total count of matching hosts (without pagination)
        total_count = await hosts_query.count()

        # Prepare the response data
        host_list = []

        for host in hosts:
            # Fetch group details using the group IDs from the host document
            groups = await Group.find({"_id": {"$in": host.group}}).to_list()
            group_data = [{"id": str(group.id), "name": group.name} for group in groups] if groups else []

            # Fetch project details using the project IDs from the host document
            projects = await Project.find({"_id": {"$in": host.project}}).to_list()
            project_data = [{"id": str(project.id), "name": project.name} for project in projects] if projects else []

            # Fetch device details using the host_ip from the host document
            devices = await Devices.find({"host_ip": host.ipAddress}).to_list()
            device_data = []
            if devices:
                for device in devices:
                    # Convert the device.registered_to to PydanticObjectId before querying.
                    if device.registered_to:
                        device_registered_to = PydanticObjectId(device.registered_to)
                        # Fetch the user corresponding to the registered_to field
                        device_user = await User.find_one(User.id == device_registered_to)
                        # Prepare the registered_to information with user_id and user_name
                        registered_to_info = {
                            "user_id": str(device.registered_to),
                            "user_name": device_user.username if device_user else None
                        }
                        device_data.append({
                            "id": str(device.id),
                            "model": device.model,
                            "udid": device.udid,
                            "state": device.state,
                            "cpu": device.cpu,
                            "manufacturer": device.manufacturer,
                            "os_version": device.os_version,
                            "sdk_version": device.sdk_version,
                            "security_id": device.security_id,
                            "registered_to": registered_to_info,
                            "host_ip": device.host_ip,
                            "status": device.status,
                        })
                    else:
                        registered_to_info = {
                            "user_id": None,
                            "user_name":  None
                        }
                        device_data.append({
                            "id": str(device.id),
                            "model": device.model,
                            "udid": device.udid,
                            "state": device.state,
                            "cpu": device.cpu,
                            "manufacturer": device.manufacturer,
                            "os_version": device.os_version,
                            "sdk_version": device.sdk_version,
                            "security_id": device.security_id,
                            "registered_to": registered_to_info,
                            "host_ip": device.host_ip,
                            "status": device.status,
                        })

            # Prepare host data
            host_data = {
                "id": str(host.id),
                "name": host.name,
                "ipAddress": host.ipAddress,
                "location": host.location,
                "os": host.os,
                "isActive": host.isActive,
                "group": group_data,
                "project": project_data,
                "devices": device_data,
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
        if host.group is not None:
            existing_host.group = host.group
        if host.project is not None:
            existing_host.project = host.project
        if host.os is not None:
            existing_host.os = host.os
        if host.ipAddress is not None:
            existing_host.ipAddress = host.ipAddress
        if host.location is not None:
            existing_host.location = host.location
        # if host.devices is not None:
        #     existing_host.devices = host.devices
        if host.member is not None:
            existing_host.member = host.member

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
