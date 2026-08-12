# SmartPark - Cloud-Based Smart Parking Management System

A full-stack IoT parking management solution with virtual sensor simulation, real-time updates, and cloud-ready architecture.

![Architecture](https://img.shields.io/badge/Backend-FastAPI-009688) ![Frontend](https://img.shields.io/badge/Frontend-React%2BTypeScript-61DAFB) ![Database](https://img.shields.io/badge/Database-SQLite-003B57)

## 🎯 Project Overview

SmartPark is a college vibe coding project demonstrating:
- **Cloud Applications** - Scalable IoT platform
- **Sensors/IoT** - Virtual ultrasonic sensor simulation
- **Real-time Processing** - WebSocket live updates
- **Cloud Architecture** - AWS-ready design
- **Scalability** - Microservices-ready structure
- **Security** - CORS, input validation, error handling
- **APIs** - RESTful design with proper status codes

## 🏗️ Architecture

```
Virtual Sensors → FastAPI Backend → SQLite Database → WebSocket → React Dashboard
```

**Future Production:**
```
Ultrasonic Sensors → ESP32 → Wi-Fi → MQTT → AWS IoT Core → Lambda → RDS → API → React
```

## 📋 Features Implemented

### ✅ Core Functionality
- **40 Parking Slots** - Visual grid with real-time status updates
- **Virtual Sensor Simulation** - Ultrasonic distance readings (15-25cm occupied, 70-100cm available)
- **Vehicle Entry/Exit** - Automatic slot status management
- **Billing System** - ₹30/hour with proportional calculation
- **Reservations** - Book slots with double-booking prevention
- **Live Simulation** - Auto-generate realistic events every 2-8 seconds
- **Sensor Health** - Battery level, signal strength, heartbeat monitoring
- **Analytics** - Revenue trends, occupancy rates (Recharts charts)
- **Live Events** - Real-time feed with filtering
- **WebSocket Broadcasting** - Instant dashboard updates

### ✅ Database
- **SQLAlchemy ORM** - 6 core models (Slot, Sensor, Vehicle, Session, Reservation, Event)
- **Realistic Seed Data** - 40 sensors, 20 vehicles, historical sessions
- **Complex Queries** - Aggregations for analytics and reporting
- **Transactional Integrity** - Proper commit/rollback handling

### ✅ Frontend
- **React 18 + TypeScript** - Type-safe component architecture
- **Vite** - Lightning-fast development server
- **Tailwind CSS** - Modern, responsive design
- **Recharts** - Beautiful database-driven charts
- **React Router** - 10 distinct pages with navigation
- **Lucide Icons** - Professional icon system

### ✅ Backend
- **FastAPI** - High-performance async Python framework
- **Pydantic v2** - Runtime data validation
- **SQLAlchemy 2.0** - Modern ORM with async support
- **CORS Middleware** - Cross-origin requests handling
- **Structured Logging** - Debug-friendly output

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- SQLite3 (included with Python)

### Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

**Backend runs on:** http://127.0.0.1:8000

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

**Frontend runs on:** http://localhost:5173

## 📡 API Endpoints

### Core API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/slots` | List all parking slots |
| POST | `/api/slots/{id}/entry` | Simulate vehicle entry |
| POST | `/api/slots/{id}/exit` | Simulate vehicle exit |
| GET | `/api/sensors` | List all sensors |
| POST | `/api/sensors/{id}/offline` | Disable sensor |
| POST | `/api/sensors/{id}/restore` | Enable sensor |

### Reservations & Sessions
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/reservations` | List reservations |
| POST | `/api/reservations` | Create reservation |
| DELETE | `/api/reservations/{id}` | Cancel reservation |
| GET | `/api/sessions` | List parking sessions |

### Analytics & Events
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/analytics` | Get dashboard analytics |
| GET | `/api/events` | Get sensor events |
| GET | `/api/vehicles` | List registered vehicles |

### Simulation Control
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/simulation/start` | Start live simulation |
| POST | `/api/simulation/pause` | Pause simulation |
| POST | `/api/simulation/resume` | Resume simulation |
| POST | `/api/simulation/stop` | Stop simulation |
| GET | `/api/simulation/status` | Get simulation status |

### WebSocket
| Endpoint | Purpose |
|----------|---------|
| `ws://127.0.0.1:8000/ws/parking` | Real-time event stream |

## 📄 Pages

### Dashboard (`/`)
- Real-time KPI cards (occupancy, revenue, sessions)
- 40-slot parking grid visualization
- Recent sensor events feed
- Occupancy & revenue charts

### Parking Map (`/map`)
- Interactive 10×4 grid layout
- Clickable slots with details modal
- Sensor telemetry display
- Entry/exit simulation controls

### Sensor Simulator (`/simulator`)
- Manual vehicle entry/exit
- Sensor offline/restore controls
- Batch traffic burst simulation
- Live sensor list with batch controls

### Reservations (`/reservations`)
- Book available slots
- View active reservations
- Cancel reservations
- Duration-based reservation system

### Analytics (`/analytics`)
- 7-day revenue breakdown
- Hourly occupancy trends
- Peak parking hours analysis
- Sensor uptime statistics

### Live Events (`/events`)
- Real-time event feed
- Filter by sensor/slot/event type
- Timestamp tracking
- Distance readings

### Vehicles (`/vehicles`)
- Registered vehicle list
- Owner information
- Parking history
- Total revenue per vehicle

### Sensors (`/sensors`)
- Sensor health monitoring
- Battery levels
- Signal strength
- Last heartbeat

## 🔧 Technology Stack

### Backend
- **Framework:** FastAPI 0.141.1
- **ORM:** SQLAlchemy 2.0.52
- **Validation:** Pydantic 2.13.4
- **Server:** Uvicorn 0.52.1
- **WebSockets:** websockets 17.0.1

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Bundler:** Vite 5
- **Styling:** Tailwind CSS 3
- **Charts:** Recharts
- **Icons:** Lucide React
- **Router:** React Router v6

### Database
- **Type:** SQLite (dev), PostgreSQL ready (prod)
- **Schema:** 6 relational models
- **Migrations:** SQLAlchemy declarative

## 📊 Database Schema

```
ParkingSlot
├── id (PK)
├── slot_number (unique)
├── status (AVAILABLE|OCCUPIED|RESERVED|OFFLINE)
├── sensor_id (FK)
├── vehicle_id (FK)
└── timestamps

Sensor
├── id (PK)
├── sensor_id (unique)
├── slot_id (FK)
├── distance_cm
├── battery_level
├── signal_strength
└── heartbeat

Vehicle
├── id (PK)
├── vehicle_number (unique)
├── owner_name
└── phone

ParkingSession
├── id (PK)
├── slot_id (FK)
├── vehicle_id (FK)
├── entry_time
├── exit_time
├── duration
├── amount (billing)
└── status

Reservation
├── id (PK)
├── slot_id (FK)
├── vehicle_id (FK)
├── start_time
├── end_time
├── status
└── created_at

SensorEvent
├── id (PK)
├── sensor_id
├── slot_id (FK)
├── event_type
├── distance_cm
└── timestamp
```

## 🎮 Testing

### Manual Testing
1. **Dashboard:** See 40 slots, KPI cards, charts
2. **Entry/Exit:** Click slot → "Simulate Park Vehicle" → See fee calculation
3. **Simulation:** Start live simulation → Watch events appear every 2-8s
4. **Reservations:** Book slot → Slot turns yellow → Cancel if needed
5. **Analytics:** Check 7-day revenue, hourly trends

### API Testing (PowerShell)
```powershell
# Health check
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/health" -UseBasicParsing | Select-Object -ExpandProperty Content

# Get analytics
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/analytics" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json

# Start simulation
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/simulation/start" -Method Post -UseBasicParsing | Select-Object -ExpandProperty Content
```

## 🔐 Sensor Logic

**Ultrasonic Distance Threshold:**
- `distance < 30cm` → **OCCUPIED** 🔴
- `distance >= 30cm` → **AVAILABLE** 🟢

**Simulated Readings:**
- Occupied: 15-25cm (vehicle detected)
- Available: 70-100cm (no vehicle)
- Offline: Sensor disabled, slot marked OFFLINE

## 💰 Billing System

**Rate:** ₹30/hour (Indian Rupees)

**Example:**
- 1 hour → ₹30
- 2.5 hours → ₹75 (proportional)
- 45 minutes → ₹22.50

## 🌐 CORS & Security

- All origins allowed (`*`) - Dev mode
- All HTTP methods enabled
- Credentials allowed
- Input validation via Pydantic
- Error handling with proper HTTP status codes

## 📈 Scalability Notes

### Ready for Production
- SQLite → PostgreSQL (change connection string)
- FastAPI → Docker container
- React build → CDN + S3
- WebSockets → Redis for horizontal scaling
- Sensor abstraction allows ESP32 implementation

### Architecture Supports
- Multiple parking facilities (add facility_id)
- Multiple sensors per slot
- Payment gateway integration
- SMS/Email notifications
- Mobile app (same REST API)

## 🛠️ Project Structure

```
smartpark/
├── backend/
│   ├── app/
│   │   ├── main.py (FastAPI app)
│   │   ├── database.py (SQLAlchemy setup)
│   │   ├── models/ (SQLAlchemy models)
│   │   ├── routers/ (API endpoints)
│   │   ├── schemas/ (Pydantic validation)
│   │   ├── services/ (Business logic)
│   │   ├── sensors/ (Sensor abstraction)
│   │   └── websocket/ (WebSocket manager)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/ (React components)
│   │   ├── pages/ (Page components)
│   │   ├── services/ (API client, WebSocket)
│   │   ├── types/ (TypeScript interfaces)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
└── README.md
```

## 📝 Environment Variables

### Backend
- `DATABASE_URL` (default: `sqlite:///./smartpark.db`)
- `UVICORN_HOST` (default: `127.0.0.1`)
- `UVICORN_PORT` (default: `8000`)

### Frontend
- `VITE_API_BASE` (default: `http://localhost:8000/api`)

## 🐛 Known Limitations

- Single instance (no distributed scaling)
- SQLite for development (upgrade to PostgreSQL for production)
- No authentication/authorization
- No payment integration
- Simulated sensors only (ready for real IoT integration)

## 🚀 Future Enhancements

- [ ] Real ESP32 sensor integration
- [ ] AWS IoT Core integration
- [ ] Mobile app (React Native)
- [ ] Payment gateway (Razorpay)
- [ ] SMS notifications
- [ ] Email reports
- [ ] Multi-facility support
- [ ] Machine learning for demand prediction
- [ ] RFID tag integration
- [ ] License plate recognition

## 📞 Support

For issues, feature requests, or questions:
1. Check the API docs: http://127.0.0.1:8000/docs
2. Review error messages in browser console
3. Check backend logs in terminal

## 📄 License

This project is for educational purposes as part of a college assignment.

## 👨‍💻 Author

Built with ❤️ for SRM Institute of Science & Technology

---

**Last Updated:** August 13, 2026  
**Status:** ✅ Production Ready (Local Dev Environment)
