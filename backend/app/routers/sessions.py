from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.parking import ParkingSession, ParkingSlot, Vehicle
from app.schemas.schemas import ParkingSessionResponse

router = APIRouter(prefix="/api/sessions", tags=["Parking Sessions"])

@router.get("", response_model=List[ParkingSessionResponse])
def get_sessions(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ParkingSession)
    if status:
        query = query.filter(ParkingSession.status == status.upper())
    sessions = query.order_by(ParkingSession.entry_time.desc()).all()

    results = []
    for s in sessions:
        slot = db.query(ParkingSlot).filter(ParkingSlot.id == s.slot_id).first()
        veh = db.query(Vehicle).filter(Vehicle.id == s.vehicle_id).first()
        results.append(ParkingSessionResponse(
            id=s.id,
            slot_id=s.slot_id,
            slot_number=slot.slot_number if slot else f"Slot #{s.slot_id}",
            vehicle_id=s.vehicle_id,
            vehicle_number=veh.vehicle_number if veh else "N/A",
            owner_name=veh.owner_name if veh else "N/A",
            entry_time=s.entry_time,
            exit_time=s.exit_time,
            duration=s.duration,
            amount=s.amount,
            status=s.status
        ))
    return results
