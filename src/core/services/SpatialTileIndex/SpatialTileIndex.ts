import { LayerInterface } from '@/core/entities/interfaces';
import { LayerId, RectDimension } from '@/core/interfaces';

import { geometry } from '@/core/math';

export type TileKey = string;
export const SPATIAL_TILE_SIZE = 2048;

export class SpatialTileIndex {
  private static instance: SpatialTileIndex | null = null;

  private readonly tiles = new Map<TileKey, Set<LayerId>>();
  private readonly layerPositions = new Map<LayerId, TileKey[]>(); // Track which tile each layer is in

  constructor(private readonly TILE_SIZE: number = SPATIAL_TILE_SIZE) {
    if (SpatialTileIndex.instance) {
      return SpatialTileIndex.instance;
    }

    SpatialTileIndex.instance = this;
  }

  getTiles() {
    return this.tiles;
  }

  getTileSize() {
    return this.TILE_SIZE;
  }

  getLayerBounds(layer: LayerInterface): RectDimension {
    const options = layer.getOptions();
    return {
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
    };
  }

  static getInstance(): SpatialTileIndex | null {
    return SpatialTileIndex.instance;
  }

  getTileKey(x: number, y: number): TileKey {
    const tileX = Math.floor(x / this.TILE_SIZE);
    const tileY = Math.floor(y / this.TILE_SIZE);
    return `${tileX},${tileY}`;
  }

  getLayersInTile(tileKey: TileKey): Set<LayerId> | undefined {
    return this.tiles.get(tileKey);
  }

  getLayersByTileBounds(tileBounds: RectDimension, layerRegistry: Map<LayerId, LayerInterface>): LayerId[] {
    const tileKey = this.getTileKey(tileBounds.x, tileBounds.y);
    const tile = this.tiles.get(tileKey);
    if (!tile) return [];

    const result: LayerId[] = [];

    for (const layerId of tile) {
      const layer = layerRegistry.get(layerId);

      if (layer) {
        const layerBounds = this.getLayerBounds(layer);

        if (geometry.boundsIntersect(layerBounds, tileBounds)) {
          result.push(layerId);
        }
      }
    }

    return result;
  }

  getTileKeys(bounds: RectDimension): TileKey[] {
    const startTileX = Math.floor(bounds.x / this.TILE_SIZE);
    const startTileY = Math.floor(bounds.y / this.TILE_SIZE);
    const endTileX = Math.floor((bounds.x + bounds.width) / this.TILE_SIZE);
    const endTileY = Math.floor((bounds.y + bounds.height) / this.TILE_SIZE);

    const keys: TileKey[] = [];
    for (let x = startTileX; x <= endTileX; x++) {
      for (let y = startTileY; y <= endTileY; y++) {
        keys.push(`${x},${y}`);
      }
    }

    return keys;
  }

  getTileBoundsFromKey(tileKey: TileKey): RectDimension {
    const [tileX, tileY] = tileKey.split(',').map(Number);
    return {
      x: tileX * this.TILE_SIZE,
      y: tileY * this.TILE_SIZE,
      width: this.TILE_SIZE,
      height: this.TILE_SIZE,
    };
  }

  getTileBounds(x: number, y: number): RectDimension {
    const tileX = Math.floor(x / this.TILE_SIZE);
    const tileY = Math.floor(y / this.TILE_SIZE);

    return {
      x: tileX * this.TILE_SIZE,
      y: tileY * this.TILE_SIZE,
      width: this.TILE_SIZE,
      height: this.TILE_SIZE,
    };
  }

  insert(layer: LayerInterface) {
    const layerId = layer.getId()!;
    const layerBounds = this.getLayerBounds(layer);

    const affectedTileKeys = this.getTileKeys(layerBounds);

    for (const tileKey of affectedTileKeys) {
      if (!this.tiles.has(tileKey)) {
        this.tiles.set(tileKey, new Set());
      }
      this.tiles.get(tileKey)!.add(layerId);
    }

    this.layerPositions.set(layerId, affectedTileKeys);
  }

  remove(layer: LayerInterface) {
    const layerId = layer.getId()!;
    const tileKeys = this.layerPositions.get(layerId);

    if (!tileKeys) return;

    for (const tileKey of tileKeys) {
      this.tiles.get(tileKey)?.delete(layerId);
    }

    this.layerPositions.delete(layerId);
  }

  move(layer: LayerInterface, newX: number, newY: number) {
    const layerId = layer.getId()!;
    const options = layer.getOptions();

    const newBounds = {
      x: newX,
      y: newY,
      width: options.width,
      height: options.height,
    };

    const oldTileKeys = this.layerPositions.get(layerId) || [];
    for (const tileKey of oldTileKeys) {
      this.tiles.get(tileKey)?.delete(layerId);
    }

    const newTileKeys = this.getTileKeys(newBounds);
    for (const tileKey of newTileKeys) {
      if (!this.tiles.has(tileKey)) {
        this.tiles.set(tileKey, new Set());
      }
      this.tiles.get(tileKey)!.add(layerId);
    }

    this.layerPositions.set(layerId, newTileKeys);
  }

  getLayersInBounds(bounds: RectDimension): LayerId[] {
    const tileKeys = this.getTileKeys(bounds);
    const layerIds: LayerId[] = [];

    for (const tileKey of tileKeys) {
      const tile = this.tiles.get(tileKey);
      if (tile) {
        layerIds.push(...Array.from(tile));
      }
    }

    return layerIds;
  }

  isLayerIntersectsTile(layer: LayerInterface, tileBounds: RectDimension): boolean {
    const layerOptions = layer.getOptions();
    const layerBounds = geometry.getRectBoundsFromDimension(layerOptions);
    const tileBoundsRect = geometry.getRectBoundsFromDimension(tileBounds);

    return geometry.isOverlapping(layerBounds, tileBoundsRect);
  }

  debugDumpState() {
    console.log('🗂️  SpatialTileIndex State:');

    console.log('  Tiles:');
    for (const [tileKey, layerSet] of this.tiles) {
      if (layerSet.size > 0) {
        console.log(`    ${tileKey}: [${Array.from(layerSet).join(', ')}]`);
      }
    }

    console.log('  Layer positions:');
    for (const [layerId, tileKeys] of this.layerPositions) {
      console.log(`    Layer ${layerId}: [${tileKeys.join(', ')}]`);
    }
  }
}
