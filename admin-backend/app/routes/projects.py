from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth import JWTBearer
from app.models import Project
from bson import ObjectId
from typing import List

router = APIRouter()

# Create a new project
@router.post("/projects", dependencies=[Depends(JWTBearer())])
async def create_project(project: Project):
    await project.create()
    return {"message": "Project created successfully", "project": project}

# Get a list of all projects
@router.get("/projects", dependencies=[Depends(JWTBearer())])
async def list_projects():
    projects = await Project.find_all().to_list()
    return projects

# Get a specific project by ID
@router.get("/projects/{project_id}", dependencies=[Depends(JWTBearer())])
async def get_project(project_id: str):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

# Update a project by ID
@router.put("/projects/{project_id}", dependencies=[Depends(JWTBearer())])
async def update_project(project_id: str, updated_data: Project):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    updated_project = await project.set(updated_data.dict(exclude_unset=True))
    return {"message": "Project updated successfully", "project": updated_project}

# Delete a project by ID
@router.delete("/projects/{project_id}", dependencies=[Depends(JWTBearer())])
async def delete_project(project_id: str):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await project.delete()
    return {"message": "Project deleted successfully"}
