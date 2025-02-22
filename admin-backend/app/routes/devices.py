from datetime import datetime
import random
from fastapi import APIRouter, Depends, HTTPException, Query
from app.middleware.auth import JWTBearer
from app.models import Devices, User, Host
from beanie import PydanticObjectId
from bson import ObjectId
from typing import List

router = APIRouter()

# Get a list of all devices
@router.get("/devices", dependencies=[Depends(JWTBearer())])
async def list_devices(
    user_id: str,  # User ID passed as a query parameter
    skip: int = Query(0, ge=0),  # Number of items to skip
    limit: int = Query(10, ge=1)  # Number of items to fetch
):
    """
    Get a paginated list of active devices based on the user's role.
    
    - SuperAdmin: Sees all active devices.
    - GroupAdmin: Sees active devices in groups they manage.
    - Regular User: Sees active devices in groups they belong to.
    """
    try:
        # Convert user_id to PydanticObjectId
        user_id_obj = PydanticObjectId(user_id)

        # Fetch the user from the database
        user = await User.find_one(User.id == user_id_obj)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Build the devices query based on the user's role
        if user.role == "SuperAdmin":
            # SuperAdmin: Fetch all active devices
            devices_query = Devices.find()
        else:
            # For GroupAdmin and Regular User, fetch active devices linked to hosts in user's groups.
            # Assume user.groups holds the list of group IDs the user manages or belongs to.
            hosts = await Host.find({
                "$and": [
                    {"isActive": True},
                    {"group": {"$in": user.groupIds}}
                ]
            }).to_list()

            # Extract host IP addresses from the matching hosts
            host_ips = [host.ipAddress for host in hosts]

            # Now, query active devices with host_ip in the collected host IPs
            devices_query = Devices.find({
                "$and": [
                    {"host_ip": {"$in": host_ips}}
                ]
            })

        # Apply pagination
        devices = await devices_query.skip(skip).limit(limit).to_list()

        total_count = await devices_query.count()

        # Return the paginated list of devices
        device_list = [{
                        "id": str(device.id),
                        "udid": device.udid,
                        "last_update": device.last_update,
                        "state": device.state,
                        "cpu": device.cpu,
                        "manufacturer": device.manufacturer,
                        "model": device.model,
                        "os_version": device.os_version,
                        "sdk_version": device.sdk_version,
                        "security_id": device.security_id,
                        "registered_to": device.registered_to,
                        "host_ip": device.host_ip,
                    } for device in devices]

        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "devices": device_list
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")



# Get a list of all devices with pagination
@router.get("/devices/list", dependencies=[Depends(JWTBearer())])
async def list_devices(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1)):
    """
    Get a paginated list of devices.
    :param skip: Number of items to skip (default: 0)
    :param limit: Number of items to return (default: 10)
    """
    try:
        # Fetch devices with pagination
        devices_query = Devices.find_all().skip(skip).limit(limit)
        devices = await devices_query.to_list()

        # Get the total count of devices (without pagination)
        total_count = await Devices.count()

        # Prepare the response data
        device_list = [
            {
                "id": str(device.id),
                "model": device.model,
            }
            for device in devices
        ]

        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "devices": device_list
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.post("/registerdevice/{device_id}", summary="Register a device to a user")
async def registed_device(device_id: str,current_token: str = Depends(JWTBearer())):
    user_id = current_token.get("sub")
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid token payload")
    device: Devices = await Devices.find_one(Devices.udid == device_id)
    if not device:
        raise HTTPException(status_code=400, detail="Invalid device id")
    if device.security_id is None:
        random_number = random.randint(10000, 99999)
        device.security_id = random_number
        device.registered_to = user_id
        await device.save()
        return random_number
    return device.security_id

# Request a device
@router.post("/request-device/{device_id}")
async def request_device(device_id: str, user_id: str):
    device = await Devices.get(device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    if device.status == "Pending":
        raise HTTPException(status_code=400, detail="Device already has a pending request")

    # Update device with request details
    device.requested_by = user_id
    device.status = "Pending"
    device.requested_at = datetime.now()
    await device.save()

    return {"message": "Device request submitted successfully"}

# Admin - Get all pending device requests
@router.get("/admin/requests")
async def get_pending_requests():
    # Find all pending devices
    pending_devices = await Devices.find(Devices.status == "Pending").to_list()

    requests = []
    for device in pending_devices:
        # Fetch the user based on ObjectId
        user = await User.get(device.requested_by)
        if not user:
            user_name = "Unknown User"
        else:
            user_name = user.username  # Get user name from user collection
        
        requests.append({
            "device_id": str(device.id),
            "device_name": device.model,
            "requested_by": user_name,  # Return user name instead of ObjectId
            "status": device.status,
            "requested_at": device.requested_at
        })

    return requests

# Admin - Approve or Reject a device request
@router.put("/admin/request/{device_id}/{action}")
async def approve_or_reject_request(device_id: str, action: str):
    device = await Devices.get(device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    if device.status != "Pending":
        raise HTTPException(status_code=400, detail="No pending request for this device")

    if action.lower() not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Invalid action")

    # Update request status
    device.status = "Approved" if action.lower() == "approve" else "Rejected"
    device.approved_or_rejected_at = datetime.now()
    
    await device.save()

    return {"message": f"Request {action.capitalize()} successfully"}