import random
from fastapi import APIRouter, Depends, HTTPException, Query
from app.middleware.auth import JWTBearer
from app.models import Devices
from bson import ObjectId
from typing import List

router = APIRouter()

# Get a list of all devices
@router.get("/devices",dependencies=[Depends(JWTBearer())])
async def list_devices():
    devices = await Devices.find_all().to_list()
    return devices

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