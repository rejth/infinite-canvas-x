import { COLORS, DEFAULT_CORNER } from '@/shared/constants';
import { TransformationMatrix } from '@/shared/interfaces';

import { BaseDrawOptions, CanvasEntityType, LayerInterface } from '@/entities/interfaces';
import { isCanvasSelection, isCanvasImage, isCanvasText, isCanvasRect } from '@/entities/lib';
import { CanvasText } from '@/entities/CanvasText';
import { CanvasRect } from '@/entities/CanvasRect';
import { Selection } from '@/entities/Selection';
import { CanvasImage } from '@/entities/CanvasImage';
import { Point } from '@/entities/Point';

import { type Renderer } from '@/services/Renderer';
import { FpsManager } from '@/services/FpsManager';
import { StorageService } from '@/services/Storage/Storage';
import { PouchDBService } from '@/services/Storage/PouchDBService';

type RedrawOptions = {
  exceptType?: CanvasEntityType;
  exceptLayer?: LayerInterface;
  forceRender?: boolean;
  callBack?: () => void;
};

export class RenderManager {
  private static instance: RenderManager | null = null;

  private layers: LayerInterface[] = [];
  private layersCounter = 0;
  private storage: StorageService | null = null;
  private pouchDB: PouchDBService | null = null;

  private constructor(protected readonly renderer: Renderer) {}

  static async create(renderer: Renderer, enableFpsManager = false) {
    if (RenderManager.instance) {
      return RenderManager.instance;
    }

    const instance = new RenderManager(renderer);
    await instance.initialize(enableFpsManager);
    RenderManager.instance = instance;

    return instance;
  }

  private async initialize(enableFpsManager = false) {
    // this.storage = await StorageService.create();
    // this.pouchDB = await PouchDBService.create();

    if (enableFpsManager) {
      new FpsManager();
    }
  }

  getIndexedDBStorage(): StorageService | null {
    return this.storage;
  }

  getPouchDBStorage(): PouchDBService | null {
    return this.pouchDB;
  }

  getContext() {
    return this.renderer.getContext();
  }

  getLayers(): LayerInterface[] {
    return this.layers;
  }

  addLayer(layer: LayerInterface) {
    this.layersCounter += 1;
    layer.setId(this.layersCounter);
    this.layers.push(layer);
    this.drawLayer(layer);
  }

  bulkAdd(layers: LayerInterface[]) {
    this.layers = layers;
    this.layersCounter = layers.length;
    this.drawScene();
  }

  removeLayer(layer: LayerInterface) {
    this.layers = this.layers.filter((item) => item.getId() !== layer.getId());
    this.reDraw();
  }

  drawLayer(layer: LayerInterface, redrawOptions?: RedrawOptions) {
    const children = layer.getChildren<BaseDrawOptions>();

    for (const child of children) {
      if (isCanvasRect(child)) {
        this.#drawRect(child);
      } else if (isCanvasSelection(child) && layer.isActive()) {
        this.#drawSelection(child);
      } else if (isCanvasImage(child)) {
        this.#drawImage(child);
      } else if (isCanvasText(child) && child.getType() !== redrawOptions?.exceptType) {
        this.#drawText(child, Boolean(redrawOptions?.forceRender));
      }
    }
  }

  findLayerByCoordinates(point: Point): LayerInterface | null {
    let length = this.layers.length - 1;

    while (length >= 0) {
      const layer = this.layers[length];

      if (layer.isPointInside(point)) {
        return layer;
      }

      length -= 1;
    }

    return null;
  }

  findMultipleLayersByCoordinates(point: Point): LayerInterface[] {
    let length = this.layers.length - 1;
    const layers: LayerInterface[] = [];

    while (length >= 0) {
      const layer = this.layers[length];

      if (layer.isPointInside(point)) {
        layers.push(layer);
      }

      length -= 1;
    }

    return layers;
  }

  drawScene(redrawOptions?: RedrawOptions) {
    for (const layer of this.layers) {
      if (layer.shouldBeRendered()) {
        if (redrawOptions?.exceptLayer) {
          if (layer.getId() !== redrawOptions?.exceptLayer.getId()) {
            this.drawLayer(layer, redrawOptions);
          }
        } else {
          this.drawLayer(layer, redrawOptions);
        }
      }
    }

    redrawOptions?.callBack?.();
  }

  reDrawSync(redrawOptions?: RedrawOptions) {
    this.renderer.clearRectSync(this.renderer.getTransformedArea());
    this.renderer.drawBackground();
    this.drawScene(redrawOptions);
  }

  reDraw(redrawOptions?: RedrawOptions) {
    this.renderer.clearRect(this.renderer.getTransformedArea(), () => {
      this.renderer.drawBackground();
      this.drawScene(redrawOptions);
    });
  }

  setTransformMatrix(transformMatrix: TransformationMatrix) {
    this.renderer.setTransformMatrix(transformMatrix);
  }

  getTransformMatrix(): TransformationMatrix {
    return this.renderer.getTransformMatrix();
  }

  #drawRect(child: CanvasRect) {
    const drawOptions = child.getOptions();
    this.renderer.fillRect(drawOptions);
  }

  #drawImage(child: CanvasImage) {
    const drawOptions = child.getOptions();
    this.renderer.drawImage(drawOptions);
  }

  #drawSelection(child: Selection) {
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

  #drawText(text: CanvasText, forceRender: boolean) {
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
