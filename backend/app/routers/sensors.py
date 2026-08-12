from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import random
from app.database import get_db
from app.models.parking import Sensor, ParkingSlot
from app.schemas.schemas import SensorResponse
from app.services.parking_service import ParkingService

router = APIRouter(prefix="/api/sensors", tags=["Sensors"])
service = ParkingService()

def find_sensor(db: Session, sensor_identifier: str):
    if sensor_identifier.isdigit():
        sensor = db.query(Sensor).filter(Sensor.id == int(sensor_identifier)).first()
    else:
        sensor = db.query(Sensor).filter(Sensor.sensor_id == sensor_identifier).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return sensor

@router.get("", response_model=List[SensorResponse])
def get_all_sensors(db: Session = Depends(get_db)):
    return db.query(Sensor).order_by(Sensor.sensor_id).all()

@router.get("/{sensor_id}", response_model=SensorResponse)
def get_sensor(sensor_id: str, db: Session = Depends(get_db)):
    return find_sensor(db, sensor_id)

@router.post("/{sensor_id}/simulate-entry")
async def simulate_sensor_entry(sensor_id: str, db: Session = Depends(get_db)):
    sensor = find_sensor(db, sensor_id)
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == sensor.slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Associated parking slot not found")
    
    # Generate random vehicle reg if none exists
    random_reg = f"KA-0{random.randint(1, 9)}-EV-{random.randint(1000, 9999)}"
    return await service.handle_vehicle_entry(db, slot_id=slot.id, vehicle_number=random_reg)

@router.post("/{sensor_id}/simulate-exit")
async def simulate_sensor_exit(sensor_id: str, db: Session = Depends(get_db)):
    sensor = find_sensor(db, sensor_id)
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == sensor.slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Associated parking slot not found")
    
    return await service.handle_vehicle_exit(db, slot_id=slot.id)

@router.post("/{sensor_id}/offline")
async def sensor_offline(sensor_id: str, db: Session = Depends(get_db)):
    sensor = find_sensor(db, sensor_id)
    return await service.toggle_sensor_offline(db, sensor_id=sensor.sensor_id, offline=True)

@router.post("/{sensor_id}/restore")
async def sensor_restore(sensor_id: str, db: Session = Depends(get_db)):
    sensor = find_sensor(db, sensor_id)
    return await service.toggle_sensor_offline(db, sensor_id=sensor.sensor_id, offline=False)
