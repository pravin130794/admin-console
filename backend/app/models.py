from datetime import datetime, timedelta
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Boolean, Table
from app.database import Base
from sqlalchemy.orm import relationship


# Association Table for User and Group
user_group_association = Table(
    "user_groups",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("group_id", Integer, ForeignKey("groups.id", ondelete="CASCADE"), primary_key=True)
)

# Association Table for User and Project
user_project_association = Table(
    "user_projects",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("project_id", Integer, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firstname = Column(String(50), unique=True, index=True)
    lastname = Column(String(50), unique=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_approved= Column(Boolean, default=True)
    tokens = relationship("UserToken", back_populates="user")
    # Relationships
    otp_record = relationship("UserOTP", back_populates="user", uselist=False)  # One-to-one relationship with UserOTP
    groups = relationship("Group", secondary=user_group_association, back_populates="users")
    projects = relationship("Project", secondary=user_project_association, back_populates="users")


class UserOTP(Base):
    __tablename__ = "user_otps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    otp = Column(String(6))
    expiration_time = Column(DateTime, default=datetime.now() + timedelta(minutes=5))  # OTP expires in 5 minutes

    # Relationships
    user = relationship("User", back_populates="otp_record")


# Many-to-many relationship tables
class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

    # Relationships
    users = relationship("User", secondary=user_group_association, back_populates="groups")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255))

    # Relationships
    users = relationship("User", secondary=user_project_association, back_populates="projects")

class UserToken(Base):
    __tablename__ = "user_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now())
    expires_at = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="tokens")