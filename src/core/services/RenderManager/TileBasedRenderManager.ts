import { CanvasEntityType, LayerInterface } from '@/core/entities/interfaces';
import { RectDimension } from '@/core/interfaces';
import { Point } from '@/core/entities/Point';

import { MBR } from '@/core/math';

import { type Renderer } from '@/core/services/Renderer';
import { SpatialTileIndex, TileKey } from '@/core/services/SpatialTileIndex';

import { BaseRenderManager, RedrawOptions } from './BaseRenderManager';

export class TileBasedRenderManager extends BaseRenderManager {
  private static instance: TileBasedRenderManager | null = null;

  private spatialIndex = new SpatialTileIndex();
  private dirtyTiles = new Set<TileKey>();
  private static isInitializing: boolean = false;
  private debugTiles = false;

  private constructor(protected readonly renderer: Renderer) {
    super(renderer);
  }

  static async create(renderer: Renderer, enableFpsManager = false) {
    if (TileBasedRenderManager.instance) {
      return TileBasedRenderManager.instance;
    }

    if (TileBasedRenderManager.isInitializing) {
      while (TileBasedRenderManager.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      return TileBasedRenderManager.instance!;
    }

    TileBasedRenderManager.isInitializing = true;

    try {
      const instance = new TileBasedRenderManager(renderer);
      await instance.initialize(enableFpsManager);
      TileBasedRenderManager.instance = instance;
      return instance;
    } finally {
      TileBasedRenderManager.isInitializing = false;
    }
  }

  static getInstance(): TileBasedRenderManager | null {
    return TileBasedRenderManager.instance;
  }

  addLayer(layer: LayerInterface): LayerInterface {
    this.layersCounter += 1;
    layer.setId(this.layersCounter);

    this.layerRegistry.set(this.layersCounter, layer);
    this.spatialIndex.insert(layer);

    this.markLayerTilesDirty(layer);
    this.redrawDirtyTiles();

    return layer;
  }

  bulkAdd(layers: LayerInterface[]) {
    this.layersCounter = Math.max(0, ...layers.map((layer) => layer.getId() ?? 0));

    for (const layer of layers) {
      const layerId = layer.getId();

      if (layerId) {
        this.layerRegistry.set(layerId, layer);
        this.spatialIndex.insert(layer);
        this.markLayerTilesDirty(layer);
      }
    }

    this.redrawDirtyTiles();
  }

  removeLayer(layer: LayerInterface): LayerInterface {
    const layerId = layer.getId();
    if (!layerId) return layer;

    this.markLayerTilesDirty(layer);

    this.layerRegistry.delete(layerId);
    this.spatialIndex.remove(layer);

    this.redrawDirtyTiles();

    return layer;
  }

  setLayerSize(layer: LayerInterface, bbox: MBR) {
    const size = bbox.size();
    const selection = layer.getChildByType(CanvasEntityType.SELECTION);

    if (selection) {
      selection.setXY(bbox.min.x, bbox.min.y);
      selection.setWidthHeight(size.x, size.y);
    }

    this.markLayerTilesDirty(layer);

    this.spatialIndex.remove(layer);
    layer.setXY(bbox.min.x, bbox.min.y);
    layer.setWidthHeight(size.x, size.y);
    this.spatialIndex.insert(layer);

    this.markLayerTilesDirty(layer);
    this.redrawDirtyTiles();
  }

  moveLayer(layer: LayerInterface, movementX: number, movementY: number) {
    this.markLayerTilesDirty(layer);

    const { x, y } = layer.getOptions();

    layer.move(movementX, movementY);
    this.spatialIndex.move(layer, x + movementX, y + movementY);

    this.markLayerTilesDirty(layer);
    this.redrawDirtyTiles();
  }

  resizeLayer(layer: LayerInterface, movementX: number, movementY: number, resizeDirection: string) {
    this.markLayerTilesDirty(layer);

    this.spatialIndex.remove(layer);
    layer.resize(movementX, movementY, resizeDirection);
    this.spatialIndex.insert(layer);

    this.markLayerTilesDirty(layer);
    this.redrawDirtyTiles();
  }

  findLayerByCoordinates(point: Point): LayerInterface | null {
    const tileKey = this.spatialIndex.getTileKey(point.x, point.y);
    const layersInTile = this.spatialIndex.getLayersInTile(tileKey);

    if (!layersInTile || layersInTile.size === 0) {
      return null;
    }

    // Check layers in reverse order (top to bottom z-order)
    const sortedLayerIds = Array.from(layersInTile).sort((a, b) => b - a);

    for (const layerId of sortedLayerIds) {
      const layer = this.layerRegistry.get(layerId);

      if (layer && layer.isPointInside(point)) {
        return layer; // Return first match (topmost layer)
      }
    }

    return null;
  }

  findMultipleLayersByCoordinates(point: Point): LayerInterface[] {
    const tileKey = this.spatialIndex.getTileKey(point.x, point.y);
    const layersInTile = this.spatialIndex.getLayersInTile(tileKey);
    const matchedLayers: LayerInterface[] = [];

    if (!layersInTile || layersInTile.size === 0) {
      return matchedLayers;
    }

    // Check layers in reverse order (top to bottom z-order)
    const sortedLayerIds = Array.from(layersInTile).sort((a, b) => b - a);

    for (const layerId of sortedLayerIds) {
      const layer = this.layerRegistry.get(layerId);

      if (layer && layer.isPointInside(point)) {
        matchedLayers.push(layer);
      }
    }

    return matchedLayers;
  }

  private markTileDirty(tileKey: TileKey) {
    this.dirtyTiles.add(tileKey);
  }

  private markLayerTilesDirty(layer: LayerInterface) {
    const options = layer.getOptions();
    const layerBounds = {
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
    };

    const affectedTileKeys = this.spatialIndex.getTileKeys(layerBounds);
    affectedTileKeys.forEach((tileKey) => this.markTileDirty(tileKey));
  }

  private drawTileRegion(tileBounds: RectDimension) {
    const layersInTile = this.spatialIndex.getLayersByTileBounds(tileBounds, this.layerRegistry);

    this.debugTileMismatches(tileBounds);

    for (const layerId of layersInTile) {
      const layer = this.layerRegistry.get(layerId);

      if (layer?.shouldBeRendered()) {
        this.drawLayer(layer);
      }
    }

    this.drawDebugTiles();
  }

  private redrawDirtyTiles() {
    for (const tileKey of this.dirtyTiles) {
      const tileBounds = this.spatialIndex.getTileBoundsFromKey(tileKey);

      this.renderer.clearRectSync(tileBounds);
      this.drawTileRegion(tileBounds);
    }

    this.dirtyTiles.clear();
  }

  protected drawViewport(redrawOptions?: RedrawOptions): void {
    const viewport = this.renderer.getTransformedArea();
    const visibleLayerIds = this.spatialIndex.getLayersInBounds(viewport);

    for (const layerId of visibleLayerIds) {
      const layer = this.layerRegistry.get(layerId);

      if (!layer?.shouldBeRendered()) {
        continue;
      }
      if (redrawOptions?.exceptLayer && layer.getId() === redrawOptions.exceptLayer.getId()) {
        continue;
      }

      this.drawLayer(layer, redrawOptions);
    }

    this.drawDebugTiles();
  }

  private debugTileMismatches(tileBounds: RectDimension) {
    if (!this.debugTiles) return;

    const tileKey = this.spatialIndex.getTileKey(tileBounds.x, tileBounds.y);
    const layersInTile = this.spatialIndex.getLayersByTileBounds(tileBounds, this.layerRegistry);

    console.log(`🧱 Drawing tile ${tileKey} - contains layers:`, layersInTile);

    // Check for mismatches - layers that shouldn't be in this tile
    for (const layerId of layersInTile) {
      const layer = this.layerRegistry.get(layerId);
      if (layer) {
        const options = layer.getOptions();
        const actualTileKey = this.spatialIndex.getTileKey(options.x, options.y);
        if (actualTileKey !== tileKey) {
          console.log(
            `🚨 MISMATCH: Layer ${layerId} at (${options.x},${options.y}) should be in tile ${actualTileKey}, but is being drawn in tile ${tileKey}`,
          );
        }
      }
    }
  }

  private drawDebugTiles() {
    if (!this.debugTiles) return;

    const viewport = this.renderer.getTransformedArea();
    const tileSize = this.spatialIndex.getTileSize();
    this.renderer.drawTileGrid(tileSize, viewport);
    this.renderer.drawDirtyTiles(this.dirtyTiles, tileSize);
  }
}
