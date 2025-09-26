import { CanvasEntityType, LayerInterface } from '@/entities/interfaces';
import { Point } from '@/entities/Point';

import { MBR } from '@/services/Geometry';
import { type Renderer } from '@/services/Renderer';

import { BaseRenderManager, RedrawOptions } from './BaseRenderManager';
import { removeLayerSync } from './lib';

export class RenderManager extends BaseRenderManager {
  private static instance: RenderManager | null = null;
  private static isInitializing: boolean = false;

  private constructor(protected readonly renderer: Renderer) {
    super(renderer);
  }

  static async create(renderer: Renderer, enableFpsManager = false) {
    if (RenderManager.instance) {
      return RenderManager.instance;
    }

    if (RenderManager.isInitializing) {
      while (RenderManager.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      return RenderManager.instance!;
    }

    RenderManager.isInitializing = true;

    try {
      const instance = new RenderManager(renderer);
      await instance.initialize(enableFpsManager);
      RenderManager.instance = instance;
      return instance;
    } finally {
      RenderManager.isInitializing = false;
    }
  }

  static getInstance(): RenderManager | null {
    return RenderManager.instance;
  }

  addLayer(layer: LayerInterface): LayerInterface {
    this.layersCounter += 1;
    layer.setId(this.layersCounter);

    this.layerRegistry.set(this.layersCounter, layer);
    this.reDrawMainCanvasOnNextFrame();

    return layer;
  }

  bulkAdd(layers: LayerInterface[]) {
    this.layersCounter = layers.length;

    for (const layer of layers) {
      const layerId = layer.getId();

      if (layerId) {
        this.layerRegistry.set(layerId, layer);
      }
    }

    this.reDrawMainCanvasOnNextFrame();
  }

  @removeLayerSync()
  removeLayer(layer: LayerInterface): LayerInterface {
    const layerId = layer.getId();
    if (!layerId) return layer;

    this.layerRegistry.delete(layerId);
    this.reDrawMainCanvasOnNextFrame();

    return layer;
  }

  setLayerSize(layer: LayerInterface, bbox: MBR) {
    const size = bbox.size();
    const selection = layer.getChildByType(CanvasEntityType.SELECTION);

    if (selection) {
      selection.setXY(bbox.min.x, bbox.min.y);
      selection.setWidthHeight(size.x, size.y);
    }

    layer.setXY(bbox.min.x, bbox.min.y);
    layer.setWidthHeight(size.x, size.y);
    this.reDrawMainCanvasOnNextFrame();
  }

  moveLayer(layer: LayerInterface, movementX: number, movementY: number) {
    layer.move(movementX, movementY);
    this.reDrawMainCanvasOnNextFrame();
  }

  resizeLayer(layer: LayerInterface, movementX: number, movementY: number, resizeDirection: string) {
    layer.resize(movementX, movementY, resizeDirection);
    this.reDrawMainCanvasOnNextFrame();
  }

  findLayerByCoordinates(point: Point): LayerInterface | null {
    // Check all layers in reverse order (top to bottom z-order)
    const sortedLayerIds = Array.from(this.layerRegistry.keys()).sort((a, b) => b - a);

    for (const layerId of sortedLayerIds) {
      const layer = this.layerRegistry.get(layerId);

      if (layer && layer.isPointInside(point)) {
        return layer; // Return first match (topmost layer)
      }
    }

    return null;
  }

  findMultipleLayersByCoordinates(point: Point): LayerInterface[] {
    const sortedLayerIds = Array.from(this.layerRegistry.keys()).sort((a, b) => b - a);
    const matchedLayers: LayerInterface[] = [];

    for (const layerId of sortedLayerIds) {
      const layer = this.layerRegistry.get(layerId);

      if (layer && layer.isPointInside(point)) {
        matchedLayers.push(layer);
      }
    }

    return matchedLayers;
  }

  protected drawViewport(redrawOptions?: RedrawOptions) {
    const layerIds = Array.from(this.layerRegistry.keys());

    for (const layerId of layerIds) {
      const layer = this.layerRegistry.get(layerId);

      if (!layer?.shouldBeRendered()) {
        continue;
      }
      if (redrawOptions?.exceptLayer && layer.getId() === redrawOptions.exceptLayer.getId()) {
        continue;
      }

      this.drawLayer(layer, redrawOptions);
    }
  }

  protected reDrawMainCanvasSync(redrawOptions?: RedrawOptions) {
    this.renderer.clearRectSync(this.renderer.getTransformedArea());
    this.drawScene(redrawOptions);
  }

  protected reDrawMainCanvasOnNextFrame(redrawOptions?: RedrawOptions) {
    this.renderer.clearRectOnNextFrame(this.renderer.getTransformedArea(), () => {
      this.drawScene(redrawOptions);
    });
  }
}
