#!/bin/bash

# Define directories
BACKEND_DIR="/Users/pravin07/Documents/PERSONAL/FREELANCER/infra_dashboard/admin-backend"
FRONTEND_DIR="/Users/pravin07/Documents/PERSONAL/FREELANCER/infra_dashboard/admin-ui"
MONGO_DOCKER_COMPOSE="/Users/pravin07/Documents/PERSONAL/FREELANCER/infra_dashboard/admin-backend/mongodb.yml"

# Function to clean up and stop processes
cleanup() {
    echo "Stopping all processes..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID
        echo "Backend stopped."
    fi

    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID
        echo "Frontend stopped."
    fi

    echo "Stopping MongoDB Docker Compose..."
    docker compose -f $MONGO_DOCKER_COMPOSE down
    echo "MongoDB stopped."

    exit 0
}

# Trap Ctrl+C to clean up processes
trap cleanup SIGINT

# Step 1: Start MongoDB using Docker Compose
echo "Starting MongoDB using Docker Compose..."
docker compose -f $MONGO_DOCKER_COMPOSE up -d
if [ $? -ne 0 ]; then
    echo "Failed to start MongoDB. Exiting..."
    exit 1
fi
echo "MongoDB is up and running."

# Step 2: Start Backend
echo "Starting Backend..."
cd $BACKEND_DIR
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Virtual environment not found. Please create it and install dependencies. Exiting..."
    docker compose -f $MONGO_DOCKER_COMPOSE down
    exit 1
fi

uvicorn app.main:app --reload &
BACKEND_PID=$!
echo "Backend is running with PID $BACKEND_PID."

# Step 3: Start Frontend
echo "Starting Frontend..."
cd $FRONTEND_DIR
if command -v pnpm >/dev/null 2>&1; then
    pnpm dev &
    FRONTEND_PID=$!
    echo "Frontend is running with PID $FRONTEND_PID."
else
    echo "PNPM is not installed. Please install PNPM and try again. Exiting..."
    docker compose -f $MONGO_DOCKER_COMPOSE down
    kill $BACKEND_PID
    exit 1
fi

# Step 4: Monitor Processes
echo "Full-stack application is running!"
echo "Use Ctrl+C to stop all processes."

# Wait for user to terminate the script
wait
