import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  saveOfflineInspection,
  getPendingOfflineInspections,
  deleteOfflineInspection
} from '../utils/offlineStorage';
import api from '../api/client';

const OfflineContext = createContext(null);

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState('');

  const refreshPendingCount = useCallback(async () => {
    try {
      const items = await getPendingOfflineInspections();
      setPendingCount(items.length);
    } catch (err) {
      console.warn('Failed to read offline queue:', err);
    }
  }, []);

  const syncQueue = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    try {
      const pendingItems = await getPendingOfflineInspections();
      if (pendingItems.length === 0) return;

      setIsSyncing(true);
      setSyncStatusMessage(`Syncing ${pendingItems.length} offline inspection(s)...`);

      let syncedSuccess = 0;

      for (const item of pendingItems) {
        try {
          const formData = new FormData();
          formData.append('applicationId', item.applicationId);
          formData.append('visualChecklist', JSON.stringify(item.visualChecklist));
          formData.append('testReadings', JSON.stringify(item.testReadings));
          formData.append('eccentricityTest', JSON.stringify(item.eccentricityTest));
          formData.append('repeatabilityTest', JSON.stringify(item.repeatabilityTest));
          formData.append('overallResult', item.overallResult);
          formData.append('stampNumberAssigned', item.stampNumberAssigned || '');
          formData.append('inspectorNotes', item.inspectorNotes || '');
          formData.append('rejectionReason', item.rejectionReason || '');
          if (item.geoCoordinates) {
            formData.append('geoCoordinates', JSON.stringify(item.geoCoordinates));
          }

          // If photos were stored as Base64/blobs, convert and append
          if (Array.isArray(item.photos)) {
            for (let i = 0; i < item.photos.length; i++) {
              const photoBlob = item.photos[i];
              if (photoBlob instanceof Blob) {
                formData.append('inspectionPhotos', photoBlob, `offline-photo-${i}.jpg`);
              }
            }
          }

          await api.post('/inspections/record', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          await deleteOfflineInspection(item.id);
          syncedSuccess++;
        } catch (postErr) {
          console.error('Failed to sync item:', item.id, postErr);
        }
      }

      await refreshPendingCount();
      setSyncStatusMessage(`Sync complete: ${syncedSuccess} inspection(s) uploaded successfully.`);
      setTimeout(() => setSyncStatusMessage(''), 4000);
    } catch (err) {
      console.error('Offline queue sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshPendingCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    refreshPendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueue, refreshPendingCount]);

  const queueInspection = async (inspectionData) => {
    const saved = await saveOfflineInspection(inspectionData);
    await refreshPendingCount();
    return saved;
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        pendingCount,
        isSyncing,
        syncStatusMessage,
        queueInspection,
        syncQueue,
        refreshPendingCount
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
