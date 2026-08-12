from abc import ABC, abstractmethod
from typing import Dict, Any

class SensorProvider(ABC):
    """
    Abstract Sensor Provider Interface.
    Decouples the core parking business logic from physical hardware / virtual simulation.
    Can be subclassed by VirtualSensorProvider (for dev/simulation) or ESP32SensorProvider (for real IoT).
    """

    @abstractmethod
    def read_distance(self, sensor_id: str, is_occupied: bool) -> float:
        """
        Reads ultrasonic distance in centimeters.
        Threshold: < 30cm -> OCCUPIED, >= 30cm -> AVAILABLE
        """
        pass

    @abstractmethod
    def simulate_vehicle_entry(self, sensor_id: str) -> Dict[str, Any]:
        """
        Simulates vehicle entry event, returning sensor readings (~15-25cm distance).
        """
        pass

    @abstractmethod
    def simulate_vehicle_exit(self, sensor_id: str) -> Dict[str, Any]:
        """
        Simulates vehicle exit event, returning sensor readings (~70-100cm distance).
        """
        pass

    @abstractmethod
    def get_sensor_health(self, sensor_id: str) -> Dict[str, Any]:
        """
        Returns sensor telemetry (battery level %, signal strength dBm, heartbeat).
        """
        pass
