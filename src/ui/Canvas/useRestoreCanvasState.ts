import { useCallback } from 'react';

import { map, take } from '@/shared/lib/sync-generators';

import { LayerInterface } from '@/entities/interfaces';

import { useCanvasContext, useToolbarContext } from '@/context';

import { LayerSerializer } from '@/services/LayerSerializer';
import { CanvasSettingsDocument, LayerDocument } from '@/services/Storage/interfaces';

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
