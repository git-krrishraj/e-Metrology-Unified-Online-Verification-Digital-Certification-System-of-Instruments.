import { openDB } from 'idb';

const DB_NAME = 'emetrology_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'offline_inspections';

export const initOfflineDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    }
  });
};

export const saveOfflineInspection = async (inspectionData) => {
  const db = await initOfflineDB();
  const entry = {
    ...inspectionData,
    savedAt: new Date().toISOString(),
    status: 'pending_sync'
  };
  const id = await db.add(STORE_NAME, entry);
  return { id, ...entry };
};

export const getPendingOfflineInspections = async () => {
  const db = await initOfflineDB();
  return db.getAll(STORE_NAME);
};

export const deleteOfflineInspection = async (id) => {
  const db = await initOfflineDB();
  return db.delete(STORE_NAME, id);
};

export const clearAllOfflineInspections = async () => {
  const db = await initOfflineDB();
  return db.clear(STORE_NAME);
};
