export type SlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'OFFLINE';
export type SensorStatus = 'ONLINE' | 'OFFLINE' | 'DEGRADED';

export interface Vehicle {
  id: number;
  vehicle_number: string;
  owner_name: string;
  phone: string;
  created_at: string;
}

export interface Sensor {
  id: number;
  sensor_id: string;
  slot_id: number;
  sensor_type: string;
  status: SensorStatus;
  distance_cm: number;
  battery_level: number;
  signal_strength: number;
  last_reading: string;
  last_heartbeat: string;
}

export interface ParkingSlot {
  id: number;
  slot_number: string;
  status: SlotStatus;
  sensor_id: string | null;
  vehicle_id: number | null;
  created_at: string;
  updated_at: string;
  sensor?: Sensor;
  vehicle?: Vehicle;
}

export interface ParkingSession {
  id: number;
  slot_id: number;
  slot_number?: string;
  vehicle_id: number;
  vehicle_number?: string;
  owner_name?: string;
  entry_time: string;
  exit_time?: string | null;
  duration: number;
  amount: number;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface Reservation {
  id: number;
  slot_id: number;
  slot_number?: string;
  vehicle_id: number;
  vehicle_number?: string;
  start_time: string;
  end_time: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
}

export interface SensorEvent {
  id: number;
  sensor_id: string;
  slot_id: number;
  slot_number?: string;
  event_type: string;
  distance_cm: number;
  timestamp: string;
}

export interface AnalyticsSummary {
  total_slots: number;
  available_slots: number;
  occupied_slots: number;
  reserved_slots: number;
  offline_slots: number;
  occupancy_percentage: number;
  revenue_today: number;
  total_revenue: number;
  active_sessions: number;
  online_sensors: number;
  total_sensors: number;
  occupancy_trend: Array<{ time: string; occupied: number; occupancy_rate: number }>;
  revenue_trend: Array<{ date: string; revenue: number }>;
}

export interface WebSocketMessage {
  type: string;
  slot_id?: number;
  slot_number?: string;
  status?: string;
  vehicle_number?: string;
  sensor_id?: string;
  distance_cm?: number;
  duration?: number;
  amount?: number;
  timestamp?: string;
  reservation_id?: number;
}
