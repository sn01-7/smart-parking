from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.parking import Reservation, ParkingSlot, Vehicle, SensorEvent, SlotStatus, ReservationStatus
from app.schemas.schemas import ReservationResponse, ReservationCreate
from app.websocket.manager import manager

router = APIRouter(prefix="/api/reservations", tags=["Reservations"])

@router.get("", response_model=List[ReservationResponse])
def get_reservations(db: Session = Depends(get_db)):
    reservations = db.query(Reservation).order_by(Reservation.created_at.desc()).all()
    res_list = []
    for r in reservations:
        slot = db.query(ParkingSlot).filter(ParkingSlot.id == r.slot_id).first()
        veh = db.query(Vehicle).filter(Vehicle.id == r.vehicle_id).first()
        res_list.append(ReservationResponse(
            id=r.id,
            slot_id=r.slot_id,
            slot_number=slot.slot_number if slot else f"Slot #{r.slot_id}",
            vehicle_id=r.vehicle_id,
            vehicle_number=veh.vehicle_number if veh else "N/A",
            start_time=r.start_time,
            end_time=r.end_time,
            status=r.status,
            created_at=r.created_at
        ))
    return res_list

@router.post("", response_model=ReservationResponse)
async def create_reservation(payload: ReservationCreate, db: Session = Depends(get_db)):
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == payload.slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    if slot.status == SlotStatus.OCCUPIED.value:
        raise HTTPException(status_code=400, detail="Cannot reserve an occupied slot")

    # Find or create vehicle
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_number == payload.vehicle_number).first()
    if not vehicle:
        vehicle = Vehicle(
            vehicle_number=payload.vehicle_number,
            owner_name=payload.owner_name,
            phone=payload.phone
        )
        db.add(vehicle)
        db.flush()

    reservation = Reservation(
        slot_id=slot.id,
        vehicle_id=vehicle.id,
        start_time=payload.start_time,
        end_time=payload.end_time,
        status=ReservationStatus.ACTIVE.value
    )
    db.add(reservation)

    # Update slot status to RESERVED
    slot.status = SlotStatus.RESERVED.value
    slot.vehicle_id = vehicle.id

    # Create sensor event
    event = SensorEvent(
        sensor_id=slot.sensor_id or f"SENSOR_{slot.slot_number}",
        slot_id=slot.id,
        event_type="RESERVATION_ACTIVATED",
        distance_cm=88.0,
        timestamp=datetime.utcnow()
    )
    db.add(event)

    db.commit()
    db.refresh(reservation)

    # WebSocket Broadcast
    await manager.broadcast({
        "type": "RESERVATION_CREATED",
        "reservation_id": reservation.id,
        "slot_number": slot.slot_number,
        "vehicle_number": vehicle.vehicle_number,
        "timestamp": datetime.utcnow().isoformat()
    })

    return ReservationResponse(
        id=reservation.id,
        slot_id=slot.id,
        slot_number=slot.slot_number,
        vehicle_id=vehicle.id,
        vehicle_number=vehicle.vehicle_number,
        start_time=reservation.start_time,
        end_time=reservation.end_time,
        status=reservation.status,
        created_at=reservation.created_at
    )

@router.delete("/{reservation_id}")
async def cancel_reservation(reservation_id: int, db: Session = Depends(get_db)):
    res = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")

    res.status = ReservationStatus.CANCELLED.value
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == res.slot_id).first()
    if slot and slot.status == SlotStatus.RESERVED.value:
        slot.status = SlotStatus.AVAILABLE.value
        slot.vehicle_id = None

    db.commit()

    await manager.broadcast({
        "type": "RESERVATION_CANCELLED",
        "reservation_id": res.id,
        "slot_number": slot.slot_number if slot else None,
        "timestamp": datetime.utcnow().isoformat()
    })

    return {"message": "Reservation cancelled successfully"}
