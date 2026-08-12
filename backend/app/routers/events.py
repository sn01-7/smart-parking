from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.parking import SensorEvent, ParkingSlot
from app.schemas.schemas import SensorEventResponse

router = APIRouter(prefix="/api/events", tags=["Sensor Events"])

@router.get("", response_model=List[SensorEventResponse])
def get_events(
    limit: int = Query(50, ge=1, le=200),
    event_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SensorEvent)
    if event_type:
        query = query.filter(SensorEvent.event_type == event_type)
    events = query.order_by(SensorEvent.timestamp.desc()).limit(limit).all()

    results = []
    for e in events:
        slot = db.query(ParkingSlot).filter(ParkingSlot.id == e.slot_id).first()
        results.append(SensorEventResponse(
            id=e.id,
            sensor_id=e.sensor_id,
            slot_id=e.slot_id,
            slot_number=slot.slot_number if slot else f"A{e.slot_id}",
            event_type=e.event_type,
            distance_cm=e.distance_cm,
            timestamp=e.timestamp
        ))
    return results
