from app.routers.slots import router as slots_router
from app.routers.sensors import router as sensors_router
from app.routers.reservations import router as reservations_router
from app.routers.sessions import router as sessions_router
from app.routers.analytics import router as analytics_router
from app.routers.events import router as events_router
from app.routers.vehicles import router as vehicles_router
from app.routers.simulation import router as simulation_router

__all__ = [
    "slots_router", "sensors_router", "reservations_router",
    "sessions_router", "analytics_router", "events_router", "vehicles_router"
]

__all__.append("simulation_router")
