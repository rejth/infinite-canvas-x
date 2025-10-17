import { useCallback } from 'react';

import { useCanvasContext, useToolbarContext } from '@/app/store';

import { map, take } from '@/core/lib/sync-generators';
import { LayerInterface } from '@/core/entities/interfaces';
import { LayerSerializer } from '@/core/entities/LayerSerializer';
import { CanvasSettingsDocument, LayerDocument } from '@/core/storage/interfaces';

export const useRestoreCanvasState = () => {
  const { renderManager } = useCanvasContext();
  const { setZoomPercentage } = useToolbarContext();

  return useCallback(async () => {
    if (!renderManager) return;

    const db = renderManager.getSyncDBInstance()?.database;
    if (!db) return;

    db.allDocs({ include_docs: true }).then((docs) => {
      const { rows, total_rows } = docs;

      if (total_rows === 0) {
        renderManager.reDrawOnNextFrame();
        return;
      }

      const canvasSettings = rows[total_rows - 1].doc;
      const { zoomPercentage, transformMatrix } = canvasSettings as CanvasSettingsDocument;

      const layers = map<(typeof rows)[number], LayerInterface>(take(rows, total_rows - 1), [
        (row) => LayerSerializer.deserialize(row.doc as LayerDocument)!,
      ]);

      renderManager.bulkAdd([...layers]);
      renderManager.setTransformMatrix(transformMatrix);
      renderManager.reDrawOnNextFrame({ forceRender: true });
      setZoomPercentage(zoomPercentage);
    });
  }, [renderManager, setZoomPercentage]);
};
