import Dexie, { type Table } from 'dexie';

export interface OutboxItem {
  id?: number;
  type: 'MESSAGE' | 'EXPENSE';
  projectId: number;
  payload: any;
  timestamp: number;
  lat: number | null;
  lng: number | null;
  status: 'pending' | 'syncing' | 'failed';
}

export class OfflineDatabase extends Dexie {
  outbox!: Table<OutboxItem>;

  constructor() {
    super('AquatechOfflineDB');
    this.version(1).stores({
      outbox: '++id, projectId, status, timestamp'
    });
  }
}

export const db = new OfflineDatabase();
