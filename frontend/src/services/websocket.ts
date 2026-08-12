import type { WebSocketMessage } from '../types';

type Listener = (message: WebSocketMessage) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Set<Listener> = new Set();
  private reconnectInterval: number = 3000;
  private isConnected: boolean = false;
  private pingIntervalId: any = null;

  public connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.socket = new WebSocket('ws://localhost:8000/ws/parking');

      this.socket.onopen = () => {
        console.log('⚡ Connected to SmartPark WebSocket feed');
        this.isConnected = true;

        // Start ping interval
        this.pingIntervalId = setInterval(() => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send('ping');
          }
        }, 15000);
      };

      this.socket.onmessage = (event) => {
        if (event.data === 'pong') return;
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      this.socket.onclose = () => {
        console.warn('⚠️ WebSocket disconnected. Reconnecting in 3s...');
        this.isConnected = false;
        this.cleanup();
        setTimeout(() => this.connect(), this.reconnectInterval);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
        this.socket?.close();
      };
    } catch (e) {
      console.error('WebSocket connection exception:', e);
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  private cleanup() {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(message: WebSocketMessage) {
    this.listeners.forEach((listener) => {
      try {
        listener(message);
      } catch (err) {
        console.error('Error in WebSocket listener:', err);
      }
    });
  }

  public getStatus(): boolean {
    return this.isConnected;
  }
}

export const wsService = new WebSocketService();
