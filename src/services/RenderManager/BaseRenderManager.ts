import { COLORS, DEFAULT_CORNER } from '@/shared/constants';
import { LayerId, TransformationMatrix } from '@/shared/interfaces';

import { BaseDrawOptions, CanvasEntityType, LayerInterface } from '@/entities/interfaces';
import { isCanvasSelection, isCanvasImage, isCanvasText, isCanvasRect } from '@/entities/lib';
import { CanvasText } from '@/entities/CanvasText';
import { CanvasRect } from '@/entities/CanvasRect';
import { Selection } from '@/entities/Selection';
import { CanvasImage } from '@/entities/CanvasImage';
import { Point } from '@/entities/Point';

import { type Renderer } from '@/services/Renderer';
import { FpsManager } from '@/services/FpsManager';
import { StorageService, PouchDBService } from '@/services/Storage';

export type RedrawOptions = {
  exceptType?: CanvasEntityType;
  exceptLayer?: LayerInterface;
  forceRender?: boolean;
  callBack?: () => void;
};

export abstract class BaseRenderManager {
  protected layersCounter = 0;
  protected layerRegistry = new Map<LayerId, LayerInterface>();

  protected localDB: StorageService | null = null;
  protected syncedDB: PouchDBService | null = null;

  constructor(protected readonly renderer: Renderer) {}

  protected async initialize(enableFpsManager = false) {
    // this.localDB = await StorageService.create();
    // this.syncedDB = await PouchDBService.create('canvas-db');

    if (enableFpsManager) {
      new FpsManager();
    }
  }

  getLocalDBInstance(): StorageService | null {
    return this.localDB;
  }

  getSyncDBInstance(): PouchDBService | null {
    return this.syncedDB;
  }

  getContext() {
    return this.renderer.getContext();
  }

  setTransformMatrix(transformMatrix: TransformationMatrix) {
    this.renderer.setTransformMatrix(transformMatrix);
  }

  getTransformMatrix(): TransformationMatrix {
    return this.renderer.getTransformMatrix();
  }

  protected getLayerRegistry(): Map<LayerId, LayerInterface> {
    return this.layerRegistry;
  }

  abstract addLayer(layer: LayerInterface): LayerInterface;
  abstract bulkAdd(layers: LayerInterface[]): void;
  abstract removeLayer(layer: LayerInterface): LayerInterface;
  abstract moveLayer(layer: LayerInterface, movementX: number, movementY: number): void;
  abstract resizeLayer(layer: LayerInterface, movementX: number, movementY: number, resizeDirection: string): void;
  abstract findLayerByCoordinates(point: Point): LayerInterface | null;
  abstract findMultipleLayersByCoordinates(point: Point): LayerInterface[];

  reDrawSync(redrawOptions?: RedrawOptions) {
    this.renderer.clearRectSync(this.renderer.getTransformedArea());
    this.renderer.drawBackground();
    this.drawScene(redrawOptions);
  }

  reDrawOnNextFrame(redrawOptions?: RedrawOptions) {
    this.renderer.clearRectOnNextFrame(this.renderer.getTransformedArea(), () => {
      this.renderer.drawBackground();
      this.drawScene(redrawOptions);
    });
  }

  drawLayer(layer: LayerInterface, redrawOptions?: RedrawOptions) {
    const children = layer.getChildren<BaseDrawOptions>();

    for (const child of children) {
      if (isCanvasRect(child)) {
        this.drawRect(child);
      } else if (isCanvasSelection(child) && layer.isActive()) {
        this.drawSelection(child);
      } else if (isCanvasImage(child)) {
        this.drawImage(child);
      } else if (isCanvasText(child) && child.getType() !== redrawOptions?.exceptType) {
        this.drawText(child, Boolean(redrawOptions?.forceRender));
      }
    }
  }

  protected abstract drawViewport(redrawOptions?: RedrawOptions): void;

  protected drawScene(redrawOptions?: RedrawOptions) {
    this.drawViewport(redrawOptions);
    redrawOptions?.callBack?.();
  }

  private drawRect(child: CanvasRect) {
    const drawOptions = child.getOptions();
    this.renderer.fillRect(drawOptions);
  }

  private drawImage(child: CanvasImage) {
    const drawOptions = child.getOptions();
    this.renderer.drawImage(drawOptions);
  }

  private drawSelection(child: Selection) {
    const drawOptions = child.getOptions();
    const corners = child.getCorners();
    let corner: keyof typeof corners;

    for (corner in corners) {
      if (corners[corner]) {
        const { x, y } = corners[corner];
        this.renderer.fillCircle({ x, y, radius: DEFAULT_CORNER, color: COLORS.SELECTION });
      }
    }

    this.renderer.strokeRect(drawOptions);
  }

  private drawText(text: CanvasText, forceRender: boolean) {
    const currentSnapshot = text.getSnapshot();
    const drawOptions = text.getOptions();

    if (currentSnapshot && !forceRender) {
      this.renderer.drawImage({ ...drawOptions, image: currentSnapshot });
    } else {
      const snapshot = this.renderer.renderTextSnapshot(text.getPreparedText(), drawOptions);
      text.setSnapshot(snapshot);
    }
  }
}
