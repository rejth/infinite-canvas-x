import { createDecorator } from '@/core/lib';
import { LayerInterface } from '@/core/entities/interfaces';
import { RenderManager } from '@/core/services/RenderManager';

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

async function removeLayer(layer: LayerInterface): Promise<void> {
  const renderManager = RenderManager.getInstance();
  if (!renderManager) return;

  const db = renderManager.getSyncDBInstance()?.database;
  if (!db) return;

  db.get(String(layer.getId())).then((doc) => {
    db.remove(doc._id, doc._rev);
  });
}
