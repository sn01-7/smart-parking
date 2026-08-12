from fastapi import APIRouter
from app.services.simulation_service import simulation_manager

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])


@router.post("/start")
async def start_simulation():
    ok = simulation_manager.start()
    return {"started": ok, "status": simulation_manager.status()}


@router.post("/pause")
async def pause_simulation():
    ok = simulation_manager.pause()
    return {"paused": ok, "status": simulation_manager.status()}


@router.post("/resume")
async def resume_simulation():
    ok = simulation_manager.resume()
    return {"resumed": ok, "status": simulation_manager.status()}


@router.post("/stop")
async def stop_simulation():
    ok = simulation_manager.stop()
    return {"stopped": ok, "status": simulation_manager.status()}


@router.get("/status")
async def get_status():
    return simulation_manager.status()
