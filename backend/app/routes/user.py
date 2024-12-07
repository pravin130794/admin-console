from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends
from typing import Annotated, List
from app import models, schemas
from app import database
from app import utils
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from app.middleware.auth import JWTBearer
from dotenv import load_dotenv
import os

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()
     

db_dependency = Annotated[Session, Depends(get_db)]


@router.post("/user",dependencies=[Depends(JWTBearer())], response_model=schemas.UserResponse)
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

@router.post("/superuser", response_model=schemas.UserResponse)
def create_user(user: schemas.SuperUserCreate, db: Session = Depends(get_db)):
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
            is_active=True,
            is_approved=True,
            is_admin=True
        )

        # Add the user to the database and commit
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return new_user
    except SQLAlchemyError as e:
        db.rollback()

# Pagination query for getting users
@router.get("/users", response_model=List[schemas.UsersResponse])
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


@router.put("/user/{user_id}",dependencies=[Depends(JWTBearer())], response_model=schemas.UserResponse)
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


@router.patch("/user/{user_id}",dependencies=[Depends(JWTBearer())], response_model=schemas.UserResponse)
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
        if user.is_admin:
            existing_user.is_admin = user.is_admin

        # Update user groups if provided
        if user.groups:
            # Assuming `groups` is a list of group IDs
            groups_to_add = db.query(models.Group).filter(models.Group.id.in_(user.groups)).all()
            existing_user.groups = groups_to_add

        # Update user projects if provided
        if user.projects:
            # Assuming `projects` is a list of project IDs
            projects_to_add = db.query(models.Project).filter(models.Project.id.in_(user.projects)).all()
            existing_user.projects = projects_to_add
            
        db.commit()
        db.refresh(existing_user)

        return existing_user
    except SQLAlchemyError as e:
        db.rollback()


@router.delete("/user/{username}",dependencies=[Depends(JWTBearer())], response_model=schemas.UserResponse)
def delete_user(username: str, db: Session = Depends(get_db)):
    try:
        # Check if user exists
        existing_user = db.query(models.User).filter(models.User.username == username).first()
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Delete the user
        db.delete(existing_user)
        db.commit()

        return existing_user
    except SQLAlchemyError as e:
        db.rollback()


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
def store_or_refresh_otp(db: Session, user_id: int):
    # Fetch existing OTP record for the user
    otp_record = db.query(models.UserOTP).filter(models.UserOTP.user_id == user_id).first()
    current_time = datetime.now()

    if otp_record:
        # Check if the existing OTP has expired
        if otp_record.expiration_time > current_time:
            return otp_record  # Return existing OTP if still valid
        else:
            # Update the OTP and expiration time if expired
            otp_record.otp = utils.generate_otp()
            otp_record.expiration_time = current_time + timedelta(minutes=5)
            db.commit()
            db.refresh(otp_record)
            return otp_record
    else:
        # Create a new OTP record if none exists
        otp = utils.generate_otp()
        expiration_time = current_time + timedelta(minutes=5)
        new_otp_record = models.UserOTP(user_id=user_id, otp=otp, expiration_time=expiration_time)
        db.add(new_otp_record)
        db.commit()
        db.refresh(new_otp_record)
        return new_otp_record

# Login API - POST request to authenticate user
@router.post("/login")
def login(user: schemas.UserLoginRequest, db: Session = Depends(get_db)):
    try:
        # Check if user exists in the database
        db_user = db.query(models.User).filter(models.User.username == user.username).first()

        if not db_user:
            raise HTTPException(status_code=400, detail="Invalid username")

        # Verify password (Here, we assume hashed passwords)
        if not utils.verify_password(user.password, db_user.hashed_password):
            raise HTTPException(status_code=400, detail="Invalid password")

        # Check if a valid token exists for the user
        valid_token = (
            db.query(models.UserToken)
            .filter(models.UserToken.user_id == db_user.id)
            .filter(models.UserToken.expires_at > datetime.now())  # Check if the token is still valid
            .first()
        )

        if valid_token:
            # Return the existing valid token
            return {"message": "Login successful.", "access_token": valid_token.token}

        # Generate a new JWT token
        token = utils.create_access_token({"sub": str(db_user.id), "username": db_user.username})

        # Calculate expiration time (e.g., 1 hour)
        expires_at = datetime.now() + timedelta(minutes=int(os.getenv('JWT_EXPIRATION_MINUTES')))

        # Store the new token in the UserToken table
        user_token = models.UserToken(user_id=db_user.id, token=token, expires_at=expires_at)
        db.add(user_token)
        db.commit()

        return {"message": "Login successful.", "access_token": token}
    except SQLAlchemyError as e:
        db.rollback()

@router.post("/logout",)
def logout(dependencies=Depends(JWTBearer()), db: Session = Depends(get_db)):
    token=dependencies
    try:
        # Delete the user's token from the UserToken table
        db.query(models.UserToken).filter(models.UserToken.user_id == int(token['sub'])).delete()
        db.commit()
        return {"message": "Logout successful."}
    except SQLAlchemyError as e:
        print(e)
        db.rollback()

@router.post("/verify-otp")
def verify_otp(otp_data: schemas.OTPVerify, db: Session = Depends(get_db)):
    try:
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
        
        if datetime.now() > otp_record.expiration_time:
            raise HTTPException(status_code=400, detail="OTP has expired")
        
        # Update the user's password
        user.hashed_password = utils.hash_password(otp_data.new_password)
        db.commit()
        db.refresh(user)
        # OTP verified, now allow the user to set a password
        return {"message": "OTP verified. Your password has been updated. Login to the system"}
    except SQLAlchemyError as e:
        db.rollback()

# API to approve user and assign multiple groups/projects
@router.post("/approve_user", dependencies=[Depends(JWTBearer())])
def approve_user(request: schemas.UserApprove, db: Session = Depends(get_db)):
    try:

        approve_user = db.query(models.User).filter(models.User.id == request.approver_user_id).first()
        if not approve_user:
            raise HTTPException(status_code=404, detail="Approve user not found")
        
        # Check if the current user is an admin
        if approve_user.is_admin == False:
            raise HTTPException(status_code=403, detail="Only admins can approve users")
        
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
        otp = store_or_refresh_otp(db, user.id)  # Store OTP in the database
        # Send OTP to user's email
        try:
            utils.send_otp_email(request.email, otp)
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to send OTP email")

        db.commit()

        return {"message": "User approved, groups and projects assigned, and OTP sent for password reset"}
    except SQLAlchemyError as e:
        db.rollback()
