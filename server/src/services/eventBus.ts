import { Response } from 'express';

export type EventType = 
  | 'BOOKING_CREATED'
  | 'BOOKING_CANCELLED'
  | 'TRIP_STATUS_UPDATED'
  | 'PASSENGER_CHECKED_IN'
  | 'OPTIMIZATION_APPROVED'
  | 'FLEET_UPDATED'
  | 'STUDENT_REGISTRY_UPDATED'
  | 'BUS_TELEMETRY'
  | 'DELAY_ALERT'
  | 'DEMAND_RECALCULATED';

export interface AppEvent {
  type: EventType;
  timestamp: string;
  data: any;
}

class EventBus {
  private clients: Set<Response> = new Set();

  public registerClient(res: Response) {
    this.clients.add(res);
    
    // Send initial ping
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString(), data: { clientCount: this.clients.size } })}\n\n`);

    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  public broadcast(type: EventType, data: any) {
    const event: AppEvent = {
      type,
      timestamp: new Date().toISOString(),
      data
    };

    const payload = `data: ${JSON.stringify(event)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }

  public getClientCount(): number {
    return this.clients.size;
  }
}

export const eventBus = new EventBus();
