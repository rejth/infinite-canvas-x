import { useCallback } from 'react';

import { useCanvasContext } from '@/app/store';
import { PouchDBService } from '@/app/services/PouchDBService';
import { LayerDocument } from '@/app/services/interfaces';

import { LayerSerializer } from '@/core/services/LayerSerializer';

export const useRestoreCanvasState = () => {
  const { renderManager } = useCanvasContext();

  return useCallback(async () => {
    if (!renderManager) return;

    const pouchdb = PouchDBService.getDatabase();
    if (!pouchdb) return;

    pouchdb.allDocs({ include_docs: true }).then((docs) => {
      const { rows, total_rows } = docs;

      if (total_rows === 0) {
        renderManager.reDrawOnNextFrame();
        return;
      }

      const layers = rows
        .map((row) => LayerSerializer.deserialize(row.doc as LayerDocument))
        .filter((layer) => layer !== null);

      renderManager.bulkAdd([...layers]);
      renderManager.reDrawOnNextFrame({ forceRender: true });
    });
  }, [renderManager]);
};
