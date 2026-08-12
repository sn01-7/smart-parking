import asyncio
import random
from typing import Optional
from datetime import datetime

from app.database import SessionLocal
from app.services.parking_service import ParkingService
from app.models.parking import ParkingSlot, Sensor, SlotStatus

class SimulationManager:
    def __init__(self, interval_seconds: float = 3.0):
        self._task: Optional[asyncio.Task] = None
        self._running = False
        self._paused = False
        self.interval = interval_seconds
        self.parking_service = ParkingService()

    async def _loop(self):
        while self._running:
            if self._paused:
                await asyncio.sleep(0.5)
                continue

            try:
                # perform a random action: entry or exit
                with SessionLocal() as db:
                    slots = db.query(ParkingSlot).all()

                    # avoid reserved slots for entry
                    available = [s for s in slots if s.status == SlotStatus.AVAILABLE.value]
                    occupied = [s for s in slots if s.status == SlotStatus.OCCUPIED.value]

                    action = random.choices(['entry', 'exit', 'heartbeat'], weights=[0.45, 0.45, 0.1])[0]

                    if action == 'entry' and available:
                        target = random.choice(available)
                        # random vehicle reg
                        reg = f"KA-{random.randint(10,99)}-EV-{random.randint(1000,9999)}"
                        await self.parking_service.handle_vehicle_entry(db, slot_id=target.id, vehicle_number=reg)

                    elif action == 'exit' and occupied:
                        target = random.choice(occupied)
                        await self.parking_service.handle_vehicle_exit(db, slot_id=target.id)

                    else:
                        # heartbeat: update some sensors health/heartbeat
                        sensors = db.query(Sensor).all()
                        if sensors:
                            s = random.choice(sensors)
                            s.last_heartbeat = datetime.utcnow()
                            s.battery_level = max(10.0, round(s.battery_level - random.uniform(0.01, 0.5), 1))
                            db.add(s)
                            db.commit()

            except Exception:
                # swallow exceptions to keep simulator running
                pass

            await asyncio.sleep(self.interval)

    def start(self):
        if self._running:
            return False
        self._running = True
        self._paused = False
        loop = asyncio.get_event_loop()
        self._task = loop.create_task(self._loop())
        return True

    def pause(self):
        if not self._running:
            return False
        self._paused = True
        return True

    def resume(self):
        if not self._running:
            return False
        self._paused = False
        return True

    def stop(self):
        if not self._running:
            return False
        self._running = False
        if self._task:
            self._task.cancel()
            self._task = None
        return True

    def status(self):
        return {"running": self._running, "paused": self._paused}


simulation_manager = SimulationManager()
