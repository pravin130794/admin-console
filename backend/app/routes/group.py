# app/routes/group.py

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


# Create a new group
@router.post("/groups",dependencies=[Depends(JWTBearer())], response_model=schemas.GroupResponse)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    return crud.create_group(db=db, group=group)


# Get all groups
@router.get("/groups",dependencies=[Depends(JWTBearer())], response_model=List[schemas.GroupResponse])
def get_groups(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_groups(db=db, skip=skip, limit=limit)


# Get a group by ID
@router.get("/groups/{group_id}",dependencies=[Depends(JWTBearer())], response_model=schemas.GroupResponse)
def get_group(group_id: int, db: Session = Depends(get_db)):
    db_group = crud.get_group_by_id(db=db, group_id=group_id)
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return db_group


# Update a group
@router.put("/groups/{group_id}",dependencies=[Depends(JWTBearer())], response_model=schemas.GroupResponse)
def update_group(group_id: int, group: schemas.GroupUpdate, db: Session = Depends(get_db)):
    db_group = crud.update_group(db=db, group_id=group_id, group=group)
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return db_group


# Delete a group
@router.delete("/groups/{group_id}",dependencies=[Depends(JWTBearer())], response_model=schemas.GroupResponse)
def delete_group(group_id: int, db: Session = Depends(get_db)):
    db_group = crud.delete_group(db=db, group_id=group_id)
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return db_group
