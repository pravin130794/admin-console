from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db, motor_client
from app.routes import users, groups, projects, devices
from dotenv import load_dotenv
from datetime import datetime
from bson import ObjectId

# Load environment variables
load_dotenv()

# FastAPI instance
app = FastAPI(title="Sapphire API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (e.g., React dev server)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def serialize_object_id(document):
    """
    Recursively convert ObjectId to string and datetime to ISO format
    in a dictionary or list. Handles nested structures.
    """
    if isinstance(document, list):
        return [serialize_object_id(item) for item in document]
    elif isinstance(document, dict):
        return {
            key: serialize_object_id(value)
            for key, value in document.items()
        }
    elif isinstance(document, ObjectId):
        return str(document)
    elif isinstance(document, datetime):
        return document.isoformat()  # Convert datetime to ISO string
    else:
        return document


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint to push MongoDB change stream events to clients.
    Handles insert, update, and delete operations in the "devices" collection.
    """
    await websocket.accept()
    try:
        # MongoDB database reference
        db = motor_client["agent"]
        collection = db["device"]
        # Watch the "devices" collection with fullDocument enabled for updates
        change_stream = collection.watch(full_document="updateLookup")

        async for change in change_stream:
            # Serialize ObjectId fields in the change stream event
            serialized_change = serialize_object_id(change)

            # Send the serialized change to the WebSocket client
            await websocket.send_json({
                "operationType": serialized_change.get("operationType"),
                "documentKey": serialized_change.get("documentKey"),
                "fullDocument": serialized_change.get("fullDocument"),
                "updateDescription": serialized_change.get("updateDescription"),
                "timestamp": datetime.utcnow().isoformat(),
            })
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"Error in WebSocket: {e}")


@app.on_event("startup")
async def startup():
    await init_db()


@app.get("/api/v1/health")
def health_check():
    return {"message": "Sapphire Dashboard API is running"}


# Include routers
app.include_router(users.router, prefix="/api/v1", tags=["Users"])
app.include_router(groups.router, prefix="/api/v1", tags=["Groups"])
app.include_router(projects.router, prefix="/api/v1", tags=["Projects"])
app.include_router(devices.router, prefix="/api/v1", tags=["Devices"])
