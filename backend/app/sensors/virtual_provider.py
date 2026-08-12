import random
from datetime import datetime
from typing import Dict, Any
from app.sensors.base import SensorProvider

class VirtualSensorProvider(SensorProvider):
    """
    Virtual Ultrasonic Sensor Provider implementation.
    Simulates HC-SR04 ultrasonic distance sensors.
    """

    DISTANCE_THRESHOLD_CM = 30.0

    def read_distance(self, sensor_id: str, is_occupied: bool) -> float:
        if is_occupied:
            # 15 cm to 25 cm when occupied
            return round(random.uniform(15.0, 25.0), 1)
        else:
            # 70 cm to 100 cm when available
            return round(random.uniform(70.0, 100.0), 1)

    def simulate_vehicle_entry(self, sensor_id: str) -> Dict[str, Any]:
        distance = round(random.uniform(15.0, 25.0), 1)
        return {
            "sensor_id": sensor_id,
            "distance_cm": distance,
            "is_occupied": distance < self.DISTANCE_THRESHOLD_CM,
            "event_type": "VEHICLE_DETECTED",
            "timestamp": datetime.utcnow().isoformat()
        }

    def simulate_vehicle_exit(self, sensor_id: str) -> Dict[str, Any]:
        distance = round(random.uniform(75.0, 95.0), 1)
        return {
            "sensor_id": sensor_id,
            "distance_cm": distance,
            "is_occupied": distance < self.DISTANCE_THRESHOLD_CM,
            "event_type": "VEHICLE_DEPARTED",
            "timestamp": datetime.utcnow().isoformat()
        }

    def get_sensor_health(self, sensor_id: str) -> Dict[str, Any]:
        return {
            "sensor_id": sensor_id,
            "battery_level": round(random.uniform(85.0, 100.0), 1),
            "signal_strength": round(random.uniform(-75.0, -50.0), 1),
            "last_heartbeat": datetime.utcnow().isoformat()
        }
