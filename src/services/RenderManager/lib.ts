import { createDecorator } from '@/shared/lib';

import { LayerInterface } from '@/entities/interfaces';

import { RenderManager } from '@/services/RenderManager';

async function removeLayer(layer: LayerInterface): Promise<void> {
  const renderManager = RenderManager.getInstance();
  if (!renderManager) return;

  const db = renderManager.getSyncDBInstance()?.database;
  if (!db) return;

  db.get(String(layer.getId())).then((doc) => {
    db.remove(doc._id, doc._rev);
  });
}

export const removeLayerSync = <T>() =>
  createDecorator<T>(async (self, originalMethod, ...args) => {
    const layer = originalMethod.apply(self, args) as LayerInterface;

    if (layer) {
      // Trigger database sync after the method execution.
      // Use setTimeout to ensure the method execution is complete and non-blocking.
      setTimeout(() => removeLayer(layer), 0);
    }

    return layer;
  });
