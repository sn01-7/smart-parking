from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.parking import Vehicle
from app.schemas.schemas import VehicleResponse, VehicleCreate

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])

@router.get("", response_model=List[VehicleResponse])
def get_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).order_by(Vehicle.created_at.desc()).all()

@router.post("", response_model=VehicleResponse)
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)):
    existing = db.query(Vehicle).filter(Vehicle.vehicle_number == payload.vehicle_number).first()
    if existing:
        return existing

    vehicle = Vehicle(
        vehicle_number=payload.vehicle_number,
        owner_name=payload.owner_name,
        phone=payload.phone
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle
