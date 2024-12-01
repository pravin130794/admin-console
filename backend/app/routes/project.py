# app/routes/project.py

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app import schemas, crud, database
from app.middleware.auth import JWTBearer

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create a new project
@router.post("/projects",dependencies=[Depends(JWTBearer())], response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    return crud.create_project(db=db, project=project)


# Get all projects
@router.get("/projects",dependencies=[Depends(JWTBearer())], response_model=List[schemas.ProjectResponse])
def get_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_projects(db=db, skip=skip, limit=limit)


# Get a project by ID
@router.get("/projects/{project_id}",dependencies=[Depends(JWTBearer())], response_model=schemas.ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    db_project = crud.get_project_by_id(db=db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project


# Update a project
@router.put("/projects/{project_id}",dependencies=[Depends(JWTBearer())], response_model=schemas.ProjectResponse)
def update_project(project_id: int, project: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    db_project = crud.update_project(db=db, project_id=project_id, project=project)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project


# Delete a project
@router.delete("/projects/{project_id}",dependencies=[Depends(JWTBearer())], response_model=schemas.ProjectResponse)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    db_project = crud.delete_project(db=db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project
