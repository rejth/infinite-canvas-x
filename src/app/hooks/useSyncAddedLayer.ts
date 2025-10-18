import { useCallback } from 'react';

import { useActiveLayerContext } from '@/app/store';
import { PouchDBService } from '@/app/services/PouchDBService';
import { LayerDocument } from '@/app/services/interfaces';

import { LayerSerializer } from '@/core/services/LayerSerializer';

export const useSyncAddedLayer = () => {
  const { activeLayer, lastActiveLayer } = useActiveLayerContext();

  const currentActiveLayer = activeLayer || lastActiveLayer;

  return useCallback(async () => {
    const pouchdb = PouchDBService.getDatabase();
    if (!currentActiveLayer || !pouchdb) return;

    const serializedLayer = LayerSerializer.serialize(currentActiveLayer);
    if (!serializedLayer) return;

    const docId = serializedLayer.id;
    if (docId) {
      (serializedLayer as LayerDocument)._id = String(docId);
    }

    try {
      const doc = await pouchdb.get(String(docId));
      (serializedLayer as LayerDocument)._rev = doc._rev;

      if (JSON.stringify(doc) === JSON.stringify(serializedLayer)) return;

      await pouchdb.put(serializedLayer);
    } catch {
      // If the layer is not found, create it
      await pouchdb.put(serializedLayer);
    }
  }, [currentActiveLayer]);
};
