import { useCallback } from 'react';

import { PouchDBService } from '@/app/services/PouchDBService';

import { LayerInterface } from '@/core/entities/interfaces';

export const useSyncDeletedLayer = () => {
  return useCallback(async (layer: LayerInterface) => {
    const pouchdb = PouchDBService.getDatabase();
    if (!pouchdb) return;

    const docId = layer.getId();
    if (!docId) return;

    pouchdb.get(String(docId)).then((doc) => {
      if (!doc) return;
      pouchdb.remove(doc);
    });
  }, []);
};
