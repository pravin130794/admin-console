import random
from fastapi import APIRouter, Depends, HTTPException
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