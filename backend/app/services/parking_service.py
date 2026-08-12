from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.parking import (
    ParkingSlot, Sensor, Vehicle, ParkingSession, Reservation, SensorEvent,
    SlotStatus, SensorStatus, SessionStatus, ReservationStatus
)
from app.sensors.base import SensorProvider
from app.sensors.virtual_provider import VirtualSensorProvider
from app.websocket.manager import manager

HOURLY_RATE = 30.0 # ₹30 / hour

class ParkingService:
    def __init__(self, sensor_provider: SensorProvider = None):
        # Default to VirtualSensorProvider, but accepts any SensorProvider subclass
        self.sensor_provider = sensor_provider or VirtualSensorProvider()

    async def handle_vehicle_entry(
        self, db: Session, slot_id: int, vehicle_number: str, owner_name: str = "Guest Driver", phone: str = "9876543210"
    ):
        slot = db.query(ParkingSlot).filter(ParkingSlot.id == slot_id).first()
        if not slot:
            raise HTTPException(status_code=404, detail="Parking slot not found")

        if slot.status == SlotStatus.OCCUPIED.value:
            raise HTTPException(status_code=400, detail=f"Slot {slot.slot_number} is already occupied")

        if slot.status == SlotStatus.OFFLINE.value:
            raise HTTPException(status_code=400, detail=f"Slot {slot.slot_number} sensor is offline")

        # Find or create vehicle
        vehicle = db.query(Vehicle).filter(Vehicle.vehicle_number == vehicle_number).first()
        if not vehicle:
            vehicle = Vehicle(
                vehicle_number=vehicle_number,
                owner_name=owner_name,
                phone=phone
            )
            db.add(vehicle)
            db.flush()

        # Generate distance reading via sensor provider (~18cm)
        sensor_data = self.sensor_provider.simulate_vehicle_entry(slot.sensor_id or f"SENSOR_{slot.slot_number}")
        
        # Update Slot
        slot.status = SlotStatus.OCCUPIED.value
        slot.vehicle_id = vehicle.id
        slot.updated_at = datetime.utcnow()

        # Update Sensor
        sensor = db.query(Sensor).filter(Sensor.slot_id == slot.id).first()
        if sensor:
            sensor.distance_cm = sensor_data["distance_cm"]
            sensor.last_reading = datetime.utcnow()
            sensor.last_heartbeat = datetime.utcnow()

        # Create Parking Session
        now = datetime.utcnow()
        session = ParkingSession(
            slot_id=slot.id,
            vehicle_id=vehicle.id,
            entry_time=now,
            status=SessionStatus.ACTIVE.value
        )
        db.add(session)

        # Store Sensor Event
        event = SensorEvent(
            sensor_id=slot.sensor_id or f"SENSOR_{slot.slot_number}",
            slot_id=slot.id,
            event_type="VEHICLE_DETECTED",
            distance_cm=sensor_data["distance_cm"],
            timestamp=now
        )
        db.add(event)

        db.commit()
        db.refresh(slot)
        db.refresh(session)

        # Broadcast via WebSocket
        ws_payload = {
            "type": "SLOT_ENTRY",
            "slot_id": slot.id,
            "slot_number": slot.slot_number,
            "status": slot.status,
            "vehicle_number": vehicle.vehicle_number,
            "sensor_id": slot.sensor_id,
            "distance_cm": sensor_data["distance_cm"],
            "timestamp": now.isoformat()
        }
        await manager.broadcast(ws_payload)

        return {
            "message": f"Vehicle {vehicle.vehicle_number} parked in slot {slot.slot_number}",
            "slot": slot,
            "session": session,
            "sensor_distance": sensor_data["distance_cm"]
        }

    async def handle_vehicle_exit(self, db: Session, slot_id: int):
        slot = db.query(ParkingSlot).filter(ParkingSlot.id == slot_id).first()
        if not slot:
            raise HTTPException(status_code=404, detail="Parking slot not found")

        if slot.status != SlotStatus.OCCUPIED.value:
            raise HTTPException(status_code=400, detail=f"Slot {slot.slot_number} is not currently occupied")

        active_session = db.query(ParkingSession).filter(
            ParkingSession.slot_id == slot.id,
            ParkingSession.status == SessionStatus.ACTIVE.value
        ).first()

        now = datetime.utcnow()
        duration_hours = 0.0
        amount = 0.0

        if active_session:
            duration_delta = now - active_session.entry_time
            duration_minutes = max(1.0, duration_delta.total_seconds() / 60.0)
            duration_hours = round(duration_minutes / 60.0, 2)
            amount = round(duration_hours * HOURLY_RATE, 2)

            active_session.exit_time = now
            active_session.duration = duration_hours
            active_session.amount = amount
            active_session.status = SessionStatus.COMPLETED.value

        # Sensor distance reading (~85cm)
        sensor_data = self.sensor_provider.simulate_vehicle_exit(slot.sensor_id or f"SENSOR_{slot.slot_number}")

        # Update Slot
        slot.status = SlotStatus.AVAILABLE.value
        slot.vehicle_id = None
        slot.updated_at = now

        # Update Sensor
        sensor = db.query(Sensor).filter(Sensor.slot_id == slot.id).first()
        if sensor:
            sensor.distance_cm = sensor_data["distance_cm"]
            sensor.last_reading = now
            sensor.last_heartbeat = now

        # Create Sensor Event
        event = SensorEvent(
            sensor_id=slot.sensor_id or f"SENSOR_{slot.slot_number}",
            slot_id=slot.id,
            event_type="VEHICLE_DEPARTED",
            distance_cm=sensor_data["distance_cm"],
            timestamp=now
        )
        db.add(event)

        db.commit()

        # WebSocket broadcast
        ws_payload = {
            "type": "SLOT_EXIT",
            "slot_id": slot.id,
            "slot_number": slot.slot_number,
            "status": slot.status,
            "duration": duration_hours,
            "amount": amount,
            "sensor_id": slot.sensor_id,
            "distance_cm": sensor_data["distance_cm"],
            "timestamp": now.isoformat()
        }
        await manager.broadcast(ws_payload)

        return {
            "message": f"Vehicle exited slot {slot.slot_number}",
            "slot_number": slot.slot_number,
            "duration_hours": duration_hours,
            "amount": amount,
            "session": active_session,
            "sensor_distance": sensor_data["distance_cm"]
        }

    async def toggle_sensor_offline(self, db: Session, sensor_id: str, offline: bool):
        sensor = db.query(Sensor).filter(Sensor.sensor_id == sensor_id).first()
        if not sensor:
            raise HTTPException(status_code=404, detail="Sensor not found")

        slot = db.query(ParkingSlot).filter(ParkingSlot.id == sensor.slot_id).first()
        now = datetime.utcnow()

        if offline:
            sensor.status = SensorStatus.OFFLINE.value
            if slot:
                slot.status = SlotStatus.OFFLINE.value
            event_type = "SENSOR_OFFLINE"
        else:
            sensor.status = SensorStatus.ONLINE.value
            if slot:
                # restore slot status based on distance
                slot.status = SlotStatus.OCCUPIED.value if sensor.distance_cm < 30.0 else SlotStatus.AVAILABLE.value
            event_type = "SENSOR_ONLINE"

        event = SensorEvent(
            sensor_id=sensor.sensor_id,
            slot_id=sensor.slot_id,
            event_type=event_type,
            distance_cm=sensor.distance_cm,
            timestamp=now
        )
        db.add(event)
        db.commit()

        # WebSocket broadcast
        await manager.broadcast({
            "type": event_type,
            "sensor_id": sensor.sensor_id,
            "slot_number": slot.slot_number if slot else None,
            "status": sensor.status,
            "timestamp": now.isoformat()
        })

        return {"message": f"Sensor {sensor_id} set to {sensor.status}", "sensor": sensor}
