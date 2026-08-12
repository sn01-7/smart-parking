from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models.parking import ParkingSlot, Sensor, ParkingSession, SlotStatus, SensorStatus, SessionStatus
from app.schemas.schemas import AnalyticsSummary

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsSummary)
def get_analytics(db: Session = Depends(get_db)):
    total_slots = db.query(ParkingSlot).count() or 40
    available_slots = db.query(ParkingSlot).filter(ParkingSlot.status == SlotStatus.AVAILABLE.value).count()
    occupied_slots = db.query(ParkingSlot).filter(ParkingSlot.status == SlotStatus.OCCUPIED.value).count()
    reserved_slots = db.query(ParkingSlot).filter(ParkingSlot.status == SlotStatus.RESERVED.value).count()
    offline_slots = db.query(ParkingSlot).filter(ParkingSlot.status == SlotStatus.OFFLINE.value).count()

    occupancy_pct = round((occupied_slots / total_slots) * 100, 1) if total_slots > 0 else 0.0

    total_sensors = db.query(Sensor).count()
    online_sensors = db.query(Sensor).filter(Sensor.status == SensorStatus.ONLINE.value).count()

    active_sessions = db.query(ParkingSession).filter(ParkingSession.status == SessionStatus.ACTIVE.value).count()

    now = datetime.utcnow()
    start_of_today = datetime(now.year, now.month, now.day)

    revenue_today_query = db.query(func.sum(ParkingSession.amount)).filter(
        ParkingSession.exit_time >= start_of_today,
        ParkingSession.status == SessionStatus.COMPLETED.value
    ).scalar()
    revenue_today = float(revenue_today_query or 0.0)

    total_revenue_query = db.query(func.sum(ParkingSession.amount)).filter(
        ParkingSession.status == SessionStatus.COMPLETED.value
    ).scalar()
    total_revenue = float(total_revenue_query or 0.0)

    # 7-day Revenue Trend
    revenue_trend = []
    for i in range(6, -1, -1):
        day_date = (now - timedelta(days=i)).date()
        day_start = datetime(day_date.year, day_date.month, day_date.day)
        day_end = day_start + timedelta(days=1)

        day_rev = db.query(func.sum(ParkingSession.amount)).filter(
            ParkingSession.exit_time >= day_start,
            ParkingSession.exit_time < day_end,
            ParkingSession.status == SessionStatus.COMPLETED.value
        ).scalar() or 0.0

        revenue_trend.append({
            "date": day_date.strftime("%b %d"),
            "revenue": round(float(day_rev), 2)
        })

    # Hourly Occupancy Trend for Today
    occupancy_trend = []
    for hour in range(0, 24, 2): # Every 2 hours
        time_str = f"{hour:02d}:00"
        # Simulate realistic bell-curve / peak hour variation based on current occupied count
        base_occ = occupied_slots
        if 8 <= hour <= 18:
            simulated_val = min(total_slots, max(2, int(base_occ + (hour % 5) - 2)))
        else:
            simulated_val = max(1, int(base_occ * 0.4))

        occupancy_trend.append({
            "time": time_str,
            "occupied": simulated_val,
            "occupancy_rate": round((simulated_val / total_slots) * 100, 1)
        })

    return AnalyticsSummary(
        total_slots=total_slots,
        available_slots=available_slots,
        occupied_slots=occupied_slots,
        reserved_slots=reserved_slots,
        offline_slots=offline_slots,
        occupancy_percentage=occupancy_pct,
        revenue_today=round(revenue_today, 2),
        total_revenue=round(total_revenue, 2),
        active_sessions=active_sessions,
        online_sensors=online_sensors,
        total_sensors=total_sensors,
        occupancy_trend=occupancy_trend,
        revenue_trend=revenue_trend
    )
