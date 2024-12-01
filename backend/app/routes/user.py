import datetime
from fastapi import APIRouter, HTTPException, Depends
from typing import Annotated, List
from datetime import datetime
from app import models, schemas
from app import database
from app import utils
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError

from app.middleware.auth import JWTBearer


router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()
     

db_dependency = Annotated[Session, Depends(get_db)]


@router.post("/users",dependencies=[Depends(JWTBearer())], response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if username or email already exists
        existing_user = db.query(models.User).filter(
            (models.User.username == user.username)
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username or email already exists")
        print(user)
        hash_password = utils.hash_password(user.password)

        # Create a new user instance
        new_user = models.User(
            firstname=user.firstname,
            lastname=user.lastname,
            username=user.username,
            email=user.email,
            hashed_password=hash_password,
            is_active=False
        )

        # Add the user to the database and commit
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return new_user
    except SQLAlchemyError as e:
        db.rollback()


# Pagination query for getting users
@router.get("/users",dependencies=[Depends(JWTBearer())], response_model=List[schemas.UsersResponse])
def get_users(
    db: Session = Depends(get_db),
    skip: int = 0,  # Default skip (pagination start)
    limit: int = 10  # Default limit (number of users per page)
):
    # Query users with pagination and join groups and projects
    users = db.query(models.User).options(
        joinedload(models.User.groups),
        joinedload(models.User.projects)
    ).offset(skip).limit(limit).all()

    return users


@router.put("/users/{user_id}",dependencies=[Depends(JWTBearer())], response_model=schemas.UserResponse)
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if user exists
        existing_user = db.query(models.User).filter(models.User.id == user_id).first()
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update user fields
        existing_user.username = user.username
        existing_user.email = user.email
        existing_user.hashed_password = utils.hash_password(user.password)  # Optionally rehash password
        existing_user.is_active = False  # You can make it editable based on your needs

        db.commit()
        db.refresh(existing_user)

        return existing_user
    except SQLAlchemyError as e:
        db.rollback()


@router.patch("/users/{user_id}",dependencies=[Depends(JWTBearer())], response_model=schemas.UserResponse)
def partial_update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    try:
        # Check if user exists
        existing_user = db.query(models.User).filter(models.User.id == user_id).first()
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update only the fields that are provided in the request
        if user.username:
            existing_user.username = user.username
        if user.email:
            existing_user.email = user.email
        if user.password:
            existing_user.hashed_password = utils.hash_password(user.password)  # Optionally rehash password
        if user.is_active:
            existing_user.is_active = user.is_active
        if user.is_approved:
            existing_user.is_approved = user.is_approved

        db.commit()
        db.refresh(existing_user)

        return existing_user
    except SQLAlchemyError as e:
        db.rollback()


@router.delete("/users/{username}",dependencies=[Depends(JWTBearer())], response_model=schemas.UserResponse)
def delete_user(username: str, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(models.User).filter(models.User.username == username).first()
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Delete the user
    db.delete(existing_user)
    db.commit()

    return existing_user


# Sign-up API - POST request to create a new user
@router.post("/sign-up")
def sign_up(user: schemas.UserSignUpRequest, db: Session = Depends(get_db)):
    try:
        # Check if username already exists
        existing_user_by_username = db.query(models.User).filter(models.User.username == user.username).first()
        if existing_user_by_username:
            raise HTTPException(status_code=400, detail="Username already taken")

        # Check if email already exists
        existing_user_by_email = db.query(models.User).filter(models.User.email == user.email).first()
        if existing_user_by_email:
            raise HTTPException(status_code=400, detail="Email already in use")

        # Hash the password (you can add password in the request if needed)
        # hashed_password = utils.hash_password("demo#123")  # You can generate a temporary password or request a password

        # Create the new user instance
        new_user = models.User(
            firstname=user.firstname,
            lastname=user.lastname,
            username=user.username,
            email=user.email,
            hashed_password='',
            is_active=False  # User is inactive until approved by admin
        )

        # Add the user to the database and commit
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Return the user response
        return {"message":"User Register successfully. Pending Request from admin"}
    except SQLAlchemyError as e:
        db.rollback()


# Function to store OTP and expiration time in the database
def store_otp(db: Session, user_id: int, otp: str):
    expiration_time = datetime.datetime.now() + datetime.timedelta(minutes=5) # OTP expires in 5 minutes
    otp_record = models.UserOTP(user_id=user_id, otp=otp, expiration_time=expiration_time)
    db.add(otp_record)
    db.commit()
    db.refresh(otp_record)
    return otp_record

# Login API - POST request to authenticate user
@router.post("/login")
def login(user: schemas.UserLoginRequest, db: Session = Depends(get_db)):
    # Check if user exists in the database
    db_user = db.query(models.User).filter(models.User.username == user.username).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid username or password")

    # Verify password (Here, we assume hashed passwords)
    if not utils.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password")

    token = utils.create_access_token({"sub": str(db_user.id), "username": db_user.username})
    return {"message": "Login successful.","access_token": token}


@router.post("/verify-otp")
def verify_otp(otp_data: schemas.OTPVerify, db: Session = Depends(get_db)):
    # Find the user by email
    user = db.query(models.User).filter(models.User.email == otp_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the OTP record for the user
    otp_record = db.query(models.UserOTP).filter(models.UserOTP.user_id == user.id).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="OTP not found or expired")
    
    # Check if the OTP matches and if it's expired
    if otp_record.otp != otp_data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    if datetime.datetime.now() > otp_record.expiration_time:
        raise HTTPException(status_code=400, detail="OTP has expired")
    
    # Update the user's password
    user.hashed_password = utils.hash_password(otp_data.new_password)
    db.commit()
    db.refresh(user)
    # OTP verified, now allow the user to set a password
    return {"message": "OTP verified. Your password has been updated. Login to the system"}


# API to approve user and assign multiple groups/projects
@router.post("/approve_user",dependencies=[Depends(JWTBearer())])
def approve_user(request: schemas.UserApprove, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(models.User).filter(models.User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Approve user
    user.is_approved = True
    user.is_active = True

    # Assign user to the specified groups
    groups = db.query(models.Group).filter(models.Group.id.in_(request.groups)).all()
    if not groups:
        raise HTTPException(status_code=404, detail="Some groups not found")
    user.groups = groups

    # Assign user to the specified projects
    projects = db.query(models.Project).filter(models.Project.id.in_(request.projects)).all()
    if not projects:
        raise HTTPException(status_code=404, detail="Some projects not found")
    user.projects = projects

    # Commit changes to DB
    db.commit()
    db.refresh(user)

    # If login is successful, generate an OTP
    otp = utils.generate_otp()
    store_otp(db, user.id, otp)  # Store OTP in the database
    print(otp)
    # Send OTP to user's email
    try:
        utils.send_otp_email(request.email, otp)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to send OTP email")

    db.commit()

    return {"message": "User approved, groups and projects assigned, and OTP sent for password reset"}