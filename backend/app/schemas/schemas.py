from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class VehicleBase(BaseModel):
    vehicle_number: str
    owner_name: str
    phone: str

class VehicleCreate(VehicleBase):
    pass

class VehicleResponse(VehicleBase):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}

class SensorBase(BaseModel):
    sensor_id: str
    slot_id: int
    sensor_type: str = "ULTRASONIC"
    status: str = "ONLINE"
    distance_cm: float
    battery_level: float
    signal_strength: float

class SensorResponse(SensorBase):
    id: int
    last_reading: datetime
    last_heartbeat: datetime
    model_config = {"from_attributes": True}

class ParkingSlotBase(BaseModel):
    slot_number: str
    status: str = "AVAILABLE"
    sensor_id: Optional[str] = None
    vehicle_id: Optional[int] = None

class ParkingSlotResponse(ParkingSlotBase):
    id: int
    created_at: datetime
    updated_at: datetime
    sensor: Optional[SensorResponse] = None
    vehicle: Optional[VehicleResponse] = None
    model_config = {"from_attributes": True}

class EntryRequest(BaseModel):
    vehicle_number: str
    owner_name: Optional[str] = "Guest Driver"
    phone: Optional[str] = "9876543210"

class ParkingSessionResponse(BaseModel):
    id: int
    slot_id: int
    slot_number: Optional[str] = None
    vehicle_id: int
    vehicle_number: Optional[str] = None
    owner_name: Optional[str] = None
    entry_time: datetime
    exit_time: Optional[datetime] = None
    duration: float
    amount: float
    status: str
    model_config = {"from_attributes": True}

class ReservationCreate(BaseModel):
    slot_id: int
    vehicle_number: str
    owner_name: str
    phone: str
    start_time: datetime
    end_time: datetime

class ReservationResponse(BaseModel):
    id: int
    slot_id: int
    slot_number: Optional[str] = None
    vehicle_id: int
    vehicle_number: Optional[str] = None
    start_time: datetime
    end_time: datetime
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}

class SensorEventResponse(BaseModel):
    id: int
    sensor_id: str
    slot_id: int
    slot_number: Optional[str] = None
    event_type: str
    distance_cm: float
    timestamp: datetime

    model_config = {"from_attributes": True}

class AnalyticsSummary(BaseModel):
    total_slots: int
    available_slots: int
    occupied_slots: int
    reserved_slots: int
    offline_slots: int
    occupancy_percentage: float
    revenue_today: float
    total_revenue: float
    active_sessions: int
    online_sensors: int
    total_sensors: int
    occupancy_trend: List[dict]
    revenue_trend: List[dict]
