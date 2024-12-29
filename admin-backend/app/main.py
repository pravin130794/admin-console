from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routes import users, groups, projects
from dotenv import load_dotenv
load_dotenv()



app = FastAPI(title='Sapphire API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_db()  # Initialize the MongoDB connection with Beanie

@app.get("/api/v1/health")
def healthCheck():
    return {"message": "Admin Dashboard API is running"}

# Include routers
app.include_router(users.router, prefix="/api/v1", tags=["Users"])
app.include_router(groups.router, prefix="/api/v1", tags=["Groups"])
app.include_router(projects.router, prefix="/api/v1", tags=["Projects"])
