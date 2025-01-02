from fastapi import APIRouter, HTTPException
from app.models import Devices
from bson import ObjectId
from typing import List

router = APIRouter()

# Get a list of all devices
@router.get("/devices")
async def list_devices():
    devices = await Devices.find_all().to_list()
    return devices

