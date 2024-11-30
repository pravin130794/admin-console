from fastapi import FastAPI
from app import models, database
from app.routes import user, group, project 

app = FastAPI()

# Create all the database tables (you can use alembic for migrations instead)
models.Base.metadata.create_all(bind=database.engine)

# Include the user-related routes
app.include_router(user.router, prefix="/api/v1", tags=["Users"])

# Include the group-related routes
app.include_router(group.router, prefix="/api/v1", tags=["Groups"])

# Include the project-related routes
app.include_router(project.router, prefix="/api/v1", tags=["Projects"])

@app.get("/api/v1/health")
def healthCheck():
    return {"message": "Admin Dashboard API is running"}
