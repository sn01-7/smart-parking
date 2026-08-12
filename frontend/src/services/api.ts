import type {
  ParkingSlot,
  Sensor,
  Reservation,
  ParkingSession,
  SensorEvent,
  AnalyticsSummary,
  Vehicle,
} from "../types";

const API_BASE_URL = "http://localhost:8000/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "An unexpected error occurred" }));
    throw new Error(errorData.detail || `HTTP Error ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Parking Slots
  async getSlots(): Promise<ParkingSlot[]> {
    const res = await fetch(`${API_BASE_URL}/slots`);
    return handleResponse<ParkingSlot[]>(res);
  },

  async getSlotById(slotId: number): Promise<ParkingSlot> {
    const res = await fetch(`${API_BASE_URL}/slots/${slotId}`);
    return handleResponse<ParkingSlot>(res);
  },

  async simulateVehicleEntry(
    slotId: number,
    vehicleNumber: string,
    ownerName?: string,
    phone?: string,
  ) {
    const res = await fetch(`${API_BASE_URL}/slots/${slotId}/entry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicle_number: vehicleNumber,
        owner_name: ownerName,
        phone,
      }),
    });
    return handleResponse<any>(res);
  },

  async simulateVehicleExit(slotId: number) {
    const res = await fetch(`${API_BASE_URL}/slots/${slotId}/exit`, {
      method: "POST",
    });
    return handleResponse<any>(res);
  },

  // Sensors
  async getSensors(): Promise<Sensor[]> {
    const res = await fetch(`${API_BASE_URL}/sensors`);
    return handleResponse<Sensor[]>(res);
  },

  async simulateSensorEntry(sensorId: string) {
    const res = await fetch(
      `${API_BASE_URL}/sensors/${sensorId}/simulate-entry`,
      { method: "POST" },
    );
    return handleResponse<any>(res);
  },

  async simulateSensorExit(sensorId: string) {
    const res = await fetch(
      `${API_BASE_URL}/sensors/${sensorId}/simulate-exit`,
      { method: "POST" },
    );
    return handleResponse<any>(res);
  },

  async toggleSensorOffline(sensorId: string) {
    const res = await fetch(`${API_BASE_URL}/sensors/${sensorId}/offline`, {
      method: "POST",
    });
    return handleResponse<any>(res);
  },

  async restoreSensor(sensorId: string) {
    const res = await fetch(`${API_BASE_URL}/sensors/${sensorId}/restore`, {
      method: "POST",
    });
    return handleResponse<any>(res);
  },

  // Reservations
  async getReservations(): Promise<Reservation[]> {
    const res = await fetch(`${API_BASE_URL}/reservations`);
    return handleResponse<Reservation[]>(res);
  },

  async createReservation(data: {
    slot_id: number;
    vehicle_number: string;
    owner_name: string;
    phone: string;
    start_time: string;
    end_time: string;
  }): Promise<Reservation> {
    const res = await fetch(`${API_BASE_URL}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<Reservation>(res);
  },

  async cancelReservation(reservationId: number) {
    const res = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
      method: "DELETE",
    });
    return handleResponse<any>(res);
  },

  // Sessions
  async getSessions(status?: string): Promise<ParkingSession[]> {
    const url = status
      ? `${API_BASE_URL}/sessions?status=${status}`
      : `${API_BASE_URL}/sessions`;
    const res = await fetch(url);
    return handleResponse<ParkingSession[]>(res);
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsSummary> {
    const res = await fetch(`${API_BASE_URL}/analytics`);
    return handleResponse<AnalyticsSummary>(res);
  },

  // Events
  async getEvents(
    limit: number = 50,
    eventType?: string,
  ): Promise<SensorEvent[]> {
    const url = eventType
      ? `${API_BASE_URL}/events?limit=${limit}&event_type=${eventType}`
      : `${API_BASE_URL}/events?limit=${limit}`;
    const res = await fetch(url);
    return handleResponse<SensorEvent[]>(res);
  },

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    const res = await fetch(`${API_BASE_URL}/vehicles`);
    return handleResponse<Vehicle[]>(res);
  },

  // Simulation controls
  async startSimulation() {
    const res = await fetch(`${API_BASE_URL}/simulation/start`, {
      method: "POST",
    });
    return handleResponse<any>(res);
  },

  async pauseSimulation() {
    const res = await fetch(`${API_BASE_URL}/simulation/pause`, {
      method: "POST",
    });
    return handleResponse<any>(res);
  },

  async resumeSimulation() {
    const res = await fetch(`${API_BASE_URL}/simulation/resume`, {
      method: "POST",
    });
    return handleResponse<any>(res);
  },

  async stopSimulation() {
    const res = await fetch(`${API_BASE_URL}/simulation/stop`, {
      method: "POST",
    });
    return handleResponse<any>(res);
  },

  async getSimulationStatus() {
    const res = await fetch(`${API_BASE_URL}/simulation/status`);
    return handleResponse<any>(res);
  },
};
