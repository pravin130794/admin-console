from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth import JWTBearer
from app.models import Host
from bson import ObjectId
from typing import List

router = APIRouter()

# Create a new host
@router.post("/hosts", dependencies=[Depends(JWTBearer())])
async def create_host(host: Host):
    await host.create()
    return {"message": "Host created successfully", "host": host}

# Get a list of all hosts
@router.get("/hosts", dependencies=[Depends(JWTBearer())])
async def list_hosts():
    hosts = await Host.find_all().to_list()
    return hosts

# Get a specific host by ID
@router.get("/hosts/{host_id}", dependencies=[Depends(JWTBearer())])
async def get_host(host_id: str):
    if not ObjectId.is_valid(host_id):
        raise HTTPException(status_code=400, detail="Invalid hosts ID")
    host = await Host.get(host_id)
    if not host:
        raise HTTPException(status_code=404, detail="Host not found")
    return host

# Update a host by ID
@router.put("/hosts/{host_id}", dependencies=[Depends(JWTBearer())])
async def update_host(host_id: str, updated_data: Host):
    if not ObjectId.is_valid(host_id):
        raise HTTPException(status_code=400, detail="Invalid host ID")
    host = await Host.get(host_id)
    if not host:
        raise HTTPException(status_code=404, detail="Hosts not found")
    updated_host = await host.set(updated_data.dict(exclude_unset=True))
    return {"message": "Host updated successfully", "host": updated_host}

# Delete a host by ID
@router.delete("/hosts/{host_id}", dependencies=[Depends(JWTBearer())])
async def delete_host(host_id: str):
    if not ObjectId.is_valid(host_id):
        raise HTTPException(status_code=400, detail="Invalid host ID")
    host = await Host.get(host_id)
    if not host:
        raise HTTPException(status_code=404, detail="Host not found")
    await host.delete()
    return {"message": "Host deleted successfully"}
