import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.parking import (
    ParkingSlot, Sensor, Vehicle, ParkingSession, Reservation, SensorEvent,
    SlotStatus, SensorStatus, SessionStatus, ReservationStatus
)

INDIAN_VEHICLE_NUMBERS = [
    "KA-01-MJ-4829", "MH-12-PQ-3310", "DL-03-CB-9102", "TN-09-AB-1122",
    "KA-05-EX-7845", "TS-07-FF-4091", "HR-26-DQ-5512", "UP-32-AZ-9901",
    "KA-03-HV-2204", "GJ-01-KL-8823", "MH-02-RS-6178", "DL-08-NW-3049",
    "KL-07-CC-1928", "AP-09-VV-7734", "KA-51-MD-9081", "TN-07-ZZ-4455",
    "MH-14-GH-1234", "RJ-14-XY-6789", "WB-02-AB-4321", "KA-04-TR-8765"
]

OWNER_NAMES = [
    "Aarav Sharma", "Priya Patel", "Vikram Malhotra", "Ananya Reddy",
    "Rohan Gupta", "Sneha Rao", "Karan Verma", "Meera Joshi",
    "Siddharth Kumar", "Pooja Nair", "Aditya Singh", "Divya Deshmukh",
    "Rahul Banerjee", "Neha Kapoor", "Amitabh Sen", "Kavya Menon",
    "Suresh Iyer", "Deepika Padukone", "Rajesh Khanna", "Sunita Agarwal"
]

HOURLY_RATE = 30.0 # ₹30 per hour

def seed_database(db: Session):
    # Check if database already seeded
    if db.query(ParkingSlot).count() > 0:
        return

    print("Seeding SmartPark database...")

    # 1. Create Vehicles
    vehicles = []
    for idx, reg_no in enumerate(INDIAN_VEHICLE_NUMBERS):
        v = Vehicle(
            vehicle_number=reg_no,
            owner_name=OWNER_NAMES[idx],
            phone=f"9876{random.randint(100000, 999999)}",
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
        )
        db.add(v)
        vehicles.append(v)
    db.commit()
    for v in vehicles:
        db.refresh(v)

    # 2. Create 40 Parking Slots & Sensors
    # 27 AVAILABLE, 10 OCCUPIED, 3 RESERVED
    slots = []
    now = datetime.utcnow()

    for i in range(1, 41):
        slot_num = f"A{i:02d}"
        sensor_id = f"SENSOR_A{i:02d}"

        if i <= 27:
            initial_status = SlotStatus.AVAILABLE
            dist = round(random.uniform(70.0, 98.0), 1)
            v_id = None
        elif i <= 37:
            initial_status = SlotStatus.OCCUPIED
            dist = round(random.uniform(15.0, 24.5), 1)
            v_id = vehicles[(i - 28) % len(vehicles)].id
        else:
            initial_status = SlotStatus.RESERVED
            dist = round(random.uniform(75.0, 95.0), 1)
            v_id = vehicles[(i - 28) % len(vehicles)].id

        slot = ParkingSlot(
            slot_number=slot_num,
            status=initial_status.value,
            sensor_id=sensor_id,
            vehicle_id=v_id,
            created_at=now - timedelta(days=30),
            updated_at=now
        )
        db.add(slot)
        db.flush()

        # Create Sensor
        sensor = Sensor(
            sensor_id=sensor_id,
            slot_id=slot.id,
            sensor_type="ULTRASONIC",
            status=SensorStatus.ONLINE.value,
            distance_cm=dist,
            battery_level=round(random.uniform(88.0, 100.0), 1),
            signal_strength=round(random.uniform(-75.0, -52.0), 1),
            last_reading=now,
            last_heartbeat=now
        )
        db.add(sensor)
        slots.append(slot)

    db.commit()

    # 3. Create Active Parking Sessions for 10 OCCUPIED slots (A28..A37)
    for i in range(28, 38):
        slot = db.query(ParkingSlot).filter(ParkingSlot.slot_number == f"A{i:02d}").first()
        veh = db.query(Vehicle).filter(Vehicle.id == slot.vehicle_id).first()
        entry_t = now - timedelta(minutes=random.randint(15, 240))
        
        session = ParkingSession(
            slot_id=slot.id,
            vehicle_id=veh.id,
            entry_time=entry_t,
            status=SessionStatus.ACTIVE.value
        )
        db.add(session)

        # Initial Sensor Event
        event = SensorEvent(
            sensor_id=slot.sensor_id,
            slot_id=slot.id,
            event_type="VEHICLE_DETECTED",
            distance_cm=round(random.uniform(16.0, 22.0), 1),
            timestamp=entry_t
        )
        db.add(event)

    # 4. Create Active Reservations for 3 RESERVED slots (A38..A40)
    for i in range(38, 41):
        slot = db.query(ParkingSlot).filter(ParkingSlot.slot_number == f"A{i:02d}").first()
        veh = db.query(Vehicle).filter(Vehicle.id == slot.vehicle_id).first()
        res = Reservation(
            slot_id=slot.id,
            vehicle_id=veh.id,
            start_time=now - timedelta(minutes=10),
            end_time=now + timedelta(hours=2),
            status=ReservationStatus.ACTIVE.value,
            created_at=now - timedelta(hours=1)
        )
        db.add(res)

        event = SensorEvent(
            sensor_id=slot.sensor_id,
            slot_id=slot.id,
            event_type="RESERVATION_ACTIVATED",
            distance_cm=88.0,
            timestamp=now - timedelta(minutes=10)
        )
        db.add(event)

    # 5. Create Historical Sessions for past 7 days to seed realistic Revenue & Occupancy data
    for day in range(7, 0, -1):
        day_date = now - timedelta(days=day)
        num_sessions = random.randint(12, 25)
        for s in range(num_sessions):
            random_slot = slots[random.randint(0, 39)]
            random_veh = vehicles[random.randint(0, len(vehicles) - 1)]
            
            entry_hour = random.randint(7, 20) # 7 AM to 8 PM
            entry_time = day_date.replace(hour=entry_hour, minute=random.randint(0, 59))
            dur_mins = random.randint(30, 240) # 30 mins to 4 hours
            exit_time = entry_time + timedelta(minutes=dur_mins)
            
            # Fee: ₹30/hour proportional
            amount = round((dur_mins / 60.0) * HOURLY_RATE, 2)
            
            hist_session = ParkingSession(
                slot_id=random_slot.id,
                vehicle_id=random_veh.id,
                entry_time=entry_time,
                exit_time=exit_time,
                duration=round(dur_mins / 60.0, 2),
                amount=amount,
                status=SessionStatus.COMPLETED.value
            )
            db.add(hist_session)

            # Historical events
            db.add(SensorEvent(
                sensor_id=random_slot.sensor_id,
                slot_id=random_slot.id,
                event_type="VEHICLE_DETECTED",
                distance_cm=round(random.uniform(15.0, 24.0), 1),
                timestamp=entry_time
            ))
            db.add(SensorEvent(
                sensor_id=random_slot.sensor_id,
                slot_id=random_slot.id,
                event_type="VEHICLE_DEPARTED",
                distance_cm=round(random.uniform(75.0, 95.0), 1),
                timestamp=exit_time
            ))

    db.commit()
    print("Database seeding completed successfully!")
