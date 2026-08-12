from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.parking import ParkingSlot, ParkingSession
from app.schemas.schemas import ParkingSlotResponse, EntryRequest
from app.services.parking_service import ParkingService

router = APIRouter(prefix="/api/slots", tags=["Parking Slots"])
service = ParkingService()

@router.get("", response_model=List[ParkingSlotResponse])
def get_all_slots(db: Session = Depends(get_db)):
    slots = db.query(ParkingSlot).order_by(ParkingSlot.slot_number).all()
    return slots

@router.get("/{slot_id}", response_model=ParkingSlotResponse)
def get_slot_by_id(slot_id: int, db: Session = Depends(get_db)):
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    return slot

@router.post("/{slot_id}/entry")
async def vehicle_entry(slot_id: int, request: EntryRequest, db: Session = Depends(get_db)):
    return await service.handle_vehicle_entry(
        db,
        slot_id=slot_id,
        vehicle_number=request.vehicle_number,
        owner_name=request.owner_name or "Guest Driver",
        phone=request.phone or "9876543210"
    )

@router.post("/{slot_id}/exit")
async def vehicle_exit(slot_id: int, db: Session = Depends(get_db)):
    return await service.handle_vehicle_exit(db, slot_id=slot_id)
