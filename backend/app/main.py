from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.database import engine, Base, SessionLocal
from app.services.seed_service import seed_database
from app.routers import (
    slots_router, sensors_router, reservations_router,
    sessions_router, analytics_router, events_router, vehicles_router
)
from app.routers import simulation_router
from app.websocket.manager import manager

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("smartpark.main")

app = FastAPI(
    title="SmartPark API",
    description="Cloud-Based Smart Parking Management System with Virtual Sensor Simulation",
    version="1.0.0"
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables & seed data on startup
@app.on_event("startup")
def startup_event():
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    logger.info("SmartPark backend ready!")

# Include REST API Routers
app.include_router(slots_router)
app.include_router(sensors_router)
app.include_router(reservations_router)
app.include_router(sessions_router)
app.include_router(analytics_router)
app.include_router(events_router)
app.include_router(vehicles_router)
app.include_router(simulation_router)

# Root endpoint - API documentation
@app.get("/")
def root():
    return {
        "message": "SmartPark API - Cloud-Based Smart Parking Management System",
        "version": "1.0.0",
        "status": "online",
        "documentation": "http://127.0.0.1:8000/docs",
        "api_base": "http://127.0.0.1:8000/api",
        "endpoints": {
            "health": "/api/health",
            "slots": "/api/slots",
            "sensors": "/api/sensors",
            "reservations": "/api/reservations",
            "sessions": "/api/sessions",
            "analytics": "/api/analytics",
            "events": "/api/events",
            "vehicles": "/api/vehicles",
            "simulation": "/api/simulation",
            "websocket": "ws://127.0.0.1:8000/ws/parking"
        },
        "frontend": "http://localhost:5173"
    }

# Health Check Endpoint
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "SmartPark Management System",
        "sensor_provider": "VirtualSensorProvider",
        "websocket_clients": len(manager.active_connections)
    }

# WebSocket Endpoint
@app.websocket("/ws/parking")
async def websocket_parking_feed(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and accept client pings
            data = await websocket.receive_text()
            # Respond to client ping
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
