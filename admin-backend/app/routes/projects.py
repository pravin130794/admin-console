from fastapi import APIRouter, Depends, HTTPException, Query
from app.middleware.auth import JWTBearer
from app.models import Project, Group, User,  CreateProjectRequest, ProjectUpdateRequest, InactivateProjectRequest
from beanie import PydanticObjectId
from bson import ObjectId
from typing import List
from datetime import datetime

router = APIRouter()

# Create a new project
@router.post("/projects",dependencies=[Depends(JWTBearer())])
async def create_project(project: CreateProjectRequest):
    """
    Create a new project with member associations and other details.
    Update the projectIds field in the Project collection for all members.
    """
    try:
        # Check if the project already exists
        existing_project = await Project.find_one(Project.name == project.name)
        if existing_project:
            raise HTTPException(status_code=400, detail="Project already exists")

        # Validate and fetch users
        users = await User.find({"_id": {"$in": project.assignedUsers}}).to_list()
        if len(users) != len(project.assignedUsers):
            raise HTTPException(status_code=404, detail="Some users not found")
        
        # Prepare the new Project
        new_project = Project(
            name=project.name,
            description=project.description,
            groupId=project.groupId,
            assignedUsers=project.assignedUsers,
            isActive=True,
            createdAt=datetime.now(),
            updatedAt=datetime.now(),
        )

        # Save the project to the database
        await new_project.create()

        return {"message": "Project created successfully", "projectId": str(new_project.id)}

    except HTTPException as error:
        raise error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Get a list of all projects
@router.get("/projects",dependencies=[Depends(JWTBearer())])
async def list_user_projects(
    user_id: str,  # User ID passed as a query parameter
    skip: int = Query(0, ge=0),  # Number of items to skip
    limit: int = Query(10, ge=1)  # Number of items to fetch
):
    """
    Get a paginated list of projects created by the user or where the user is a member.
    SuperAdmin can see all active projects.
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
            # SuperAdmin fetches all active projects
            projects_query = Project.find({"isActive": True})
        else:
            # Fetch projects where the user is assigned
            projects_query = Project.find({
                "$and": [
                    {"isActive": True},
                    {"assignedUsers": {"$in": [user_id]}}
                ]
            })

        # Apply pagination
        projects = await projects_query.skip(skip).limit(limit).to_list()

        # Get the total count of matching projects (without pagination)
        total_count = await projects_query.count()

        # Prepare the response data
        project_list = []

        for project in projects:
            # Fetch the group data for the project
            group = await Group.find_one(Group.id == project.groupId)

            # Fetch the user data for the assigned users
            assigned_users = await User.find({"_id": {"$in": project.assignedUsers}}).to_list()

            # Prepare the group name and assigned user names
            group_name = group.name if group else "Unknown"
            assigned_user_names = [{"username":user.username,"id":str(user.id)} for user in assigned_users]

            project_data = {
                "id": str(project.id),
                "name": project.name,
                "description": project.description,
                "status": project.status,
                "groupId": str(project.groupId),
                "groupName": group_name,
                "assignedUsers": assigned_user_names,
                "isActive": project.isActive
            }

            project_list.append(project_data)

        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "projects": project_list
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


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
@router.put("/projects",dependencies=[Depends(JWTBearer())])
async def partial_update_project(project: ProjectUpdateRequest):
    """
    Partially update project details.
    """
    try:
        # Convert project_id to PydanticObjectId
        project_id = PydanticObjectId(project.id)

        # Check if project exists
        existing_project = await Project.find_one(Project.id == project_id)
        if not existing_project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Update fields provided in the request
        if project.name is not None:
            existing_project.name = project.name
        if project.description is not None:
            existing_project.description = project.description
        if project.status is not None:
            existing_project.status = project.status
        if project.groupId is not None:
            existing_project.groupId = project.groupId

        # Save the group changes
        await existing_project.save()

        return {
            "message": "Project updated successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# Delete a project by ID
@router.patch("/project/{project_id}/inactivate",dependencies=[Depends(JWTBearer())])
async def inactivate_project(project_id: str, request: InactivateProjectRequest):
    """
    Inactivate a project by setting isActive to False, storing the reason,
    and removing the project ID from associated users' projectIds.
    """
    try:
        # Validate and convert project_id to PydanticObjectId
        if not PydanticObjectId.is_valid(project_id):
            raise HTTPException(status_code=400, detail="Invalid project ID")
        project_id = PydanticObjectId(project_id)

        # Find the project in the database
        project = await Project.find_one(Project.id == project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Update the project's status and add a reason for inactivation
        project.isActive = False
        project.reason = request.reason
        project.updatedAt = datetime.now()

        # Save the changes to the project
        await project.save()

        return {"message": "Project inactivated successfully"}

    except HTTPException as error:
        raise error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
