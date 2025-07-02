import { LayerInterface } from '@/entities/interfaces';
import { LayerId, RectDimension } from '@/shared/interfaces';

import { geometry } from '@/services/Geometry';

export type TileKey = string;

/**
 * Insert	O(1) - Adding new stickers
 * Move	O(1)	Dragging objects
 * Query O(1)	Finding objects in a given area
 */
export class SpatialTileIndex {
  private static instance: SpatialTileIndex | null = null;

  private readonly tiles = new Map<TileKey, Set<LayerId>>();
  private readonly layerPositions = new Map<LayerId, TileKey>(); // Track which tile each layer is in

  constructor(private readonly TILE_SIZE: number = 2048) {
    if (SpatialTileIndex.instance) {
      return SpatialTileIndex.instance;
    }

    SpatialTileIndex.instance = this;
  }

  getTiles() {
    return this.tiles;
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
    const options = layer.getOptions();
    const tileKey = this.getTileKey(options.x, options.y);

    if (!this.tiles.has(tileKey)) {
      this.tiles.set(tileKey, new Set());
    }

    this.tiles.get(tileKey)!.add(layerId);
    this.layerPositions.set(layerId, tileKey);
  }

  remove(layer: LayerInterface) {
    const layerId = layer.getId()!;
    const tileKey = this.layerPositions.get(layerId);

    if (!tileKey) return;

    const tile = this.tiles.get(tileKey);
    tile?.delete(layerId);

    if (tile?.size === 0) {
      this.tiles.delete(tileKey);
    }

    this.layerPositions.delete(layerId);
  }

  move(layer: LayerInterface, newX: number, newY: number) {
    const layerId = layer.getId()!;
    const oldTileKey = this.layerPositions.get(layerId);
    const newTileKey = this.getTileKey(newX, newY);

    if (oldTileKey && oldTileKey !== newTileKey) {
      this.tiles.get(oldTileKey)?.delete(layerId);

      if (!this.tiles.has(newTileKey)) {
        this.tiles.set(newTileKey, new Set());
      }

      this.tiles.get(newTileKey)!.add(layerId);
      this.layerPositions.set(layerId, newTileKey);
    }
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
}
