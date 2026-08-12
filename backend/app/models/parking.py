from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class SlotStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    OCCUPIED = "OCCUPIED"
    RESERVED = "RESERVED"
    OFFLINE = "OFFLINE"

class SensorStatus(str, enum.Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    DEGRADED = "DEGRADED"

class SessionStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"

class ReservationStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class ParkingSlot(Base):
    __tablename__ = "parking_slots"

    id = Column(Integer, primary_key=True, index=True)
    slot_number = Column(String(20), unique=True, nullable=False, index=True)
    status = Column(String(20), default=SlotStatus.AVAILABLE.value, nullable=False)
    sensor_id = Column(String(50), nullable=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sensor = relationship("Sensor", uselist=False, back_populates="slot", cascade="all, delete-orphan")
    vehicle = relationship("Vehicle", back_populates="slots")
    sessions = relationship("ParkingSession", back_populates="slot")
    reservations = relationship("Reservation", back_populates="slot")
    events = relationship("SensorEvent", back_populates="slot")

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(50), unique=True, nullable=False, index=True)
    slot_id = Column(Integer, ForeignKey("parking_slots.id"), nullable=False)
    sensor_type = Column(String(50), default="ULTRASONIC")
    status = Column(String(20), default=SensorStatus.ONLINE.value, nullable=False)
    distance_cm = Column(Float, default=85.0)
    battery_level = Column(Float, default=98.0)
    signal_strength = Column(Float, default=-65.0)
    last_reading = Column(DateTime, default=datetime.utcnow)
    last_heartbeat = Column(DateTime, default=datetime.utcnow)

    # Relationships
    slot = relationship("ParkingSlot", back_populates="sensor")

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String(20), unique=True, nullable=False, index=True)
    owner_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    slots = relationship("ParkingSlot", back_populates="vehicle")
    sessions = relationship("ParkingSession", back_populates="vehicle")
    reservations = relationship("Reservation", back_populates="vehicle")

class ParkingSession(Base):
    __tablename__ = "parking_sessions"

    id = Column(Integer, primary_key=True, index=True)
    slot_id = Column(Integer, ForeignKey("parking_slots.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    entry_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    exit_time = Column(DateTime, nullable=True)
    duration = Column(Float, default=0.0) # in minutes
    amount = Column(Float, default=0.0) # in INR (₹)
    status = Column(String(20), default=SessionStatus.ACTIVE.value, nullable=False)

    # Relationships
    slot = relationship("ParkingSlot", back_populates="sessions")
    vehicle = relationship("Vehicle", back_populates="sessions")

class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    slot_id = Column(Integer, ForeignKey("parking_slots.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(String(20), default=ReservationStatus.PENDING.value, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    slot = relationship("ParkingSlot", back_populates="reservations")
    vehicle = relationship("Vehicle", back_populates="reservations")

class SensorEvent(Base):
    __tablename__ = "sensor_events"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(50), nullable=False, index=True)
    slot_id = Column(Integer, ForeignKey("parking_slots.id"), nullable=False)
    event_type = Column(String(50), nullable=False)
    distance_cm = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    slot = relationship("ParkingSlot", back_populates="events")
