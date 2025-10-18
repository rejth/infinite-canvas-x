import { DEFAULT_CORNER } from '@/core/constants';
import { Colors, LayerId, TransformationMatrix } from '@/core/interfaces';

import { MBR } from '@/core/math';

import { BaseDrawOptions, CanvasEntityType, LayerInterface } from '@/core/entities/interfaces';
import { CanvasText } from '@/core/entities/CanvasText';
import { CanvasRect } from '@/core/entities/CanvasRect';
import { Selection } from '@/core/entities/Selection';
import { CanvasImage } from '@/core/entities/CanvasImage';
import { CanvasCircle } from '@/core/entities/CanvasCirce';
import { CanvasSpline } from '@/core/entities/CanvasSpline';
import { Point } from '@/core/entities/Point';
import * as guards from '@/core/entities/lib';

import { type Renderer } from '@/core/services/Renderer';
import { FpsManager } from '@/core/services/FpsManager';

export type RedrawOptions = {
  exceptType?: CanvasEntityType;
  exceptLayer?: LayerInterface;
  forceRender?: boolean;
  callBack?: () => void;
};

export abstract class BaseRenderManager {
  protected layersCounter = 0;
  protected layerRegistry = new Map<LayerId, LayerInterface>();

  constructor(protected readonly renderer: Renderer) {}

  protected async initialize(enableFpsManager = false) {
    if (enableFpsManager) {
      new FpsManager();
    }
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
  abstract setLayerSize(layer: LayerInterface, bbox: MBR): void;
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
    const opacity = layer.getOpacity();
    const ctx = this.renderer.getContext();

    ctx.save();
    ctx.globalAlpha = opacity;

    for (const child of children) {
      const isExceptType = child.getType() === redrawOptions?.exceptType;
      if (guards.isCanvasRect(child)) {
        this.drawRect(child);
      } else if (guards.isCanvasText(child) && !isExceptType) {
        this.drawText(child, Boolean(redrawOptions?.forceRender));
      } else if (guards.isCanvasSpline(child)) {
        this.drawTextOnSpline(child);
      } else if (guards.isCanvasCircle(child)) {
        this.drawCircle(child);
      } else if (guards.isCanvasImage(child)) {
        this.drawImage(child, Boolean(redrawOptions?.forceRender));
      }
    }

    ctx.restore();

    if (layer.isActive()) {
      for (const child of children) {
        if (guards.isCanvasSelection(child)) {
          this.drawSelection(child);
        }
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

  private drawSelection(child: Selection) {
    const drawOptions = child.getOptions();
    const corners = child.getCorners();
    let corner: keyof typeof corners;

    for (corner in corners) {
      if (corners[corner]) {
        const { x, y } = corners[corner];
        this.renderer.fillCircle({ x, y, radius: DEFAULT_CORNER, color: Colors.SELECTION });
      }
    }

    this.renderer.strokeRect(drawOptions);
  }

  private drawCircle(child: CanvasCircle) {
    const drawOptions = child.getOptions();
    this.renderer.fillCircle(drawOptions);
  }

  private drawTextOnSpline(child: CanvasSpline) {
    if (child.curves.length === 0) return;

    this.renderer.drawSpline(child.curves, child.allControlPoints, child.handles);
    this.renderer.drawTextOnSpline(child.curves, child.getOptions());
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

  private drawImage(child: CanvasImage, forceRender: boolean) {
    const currentSnapshot = child.snapshot;
    const drawOptions = child.getOptions();

    if (currentSnapshot && !forceRender) {
      this.renderer.drawImage({ ...drawOptions, image: currentSnapshot });
    } else {
      const snapshot = this.renderer.renderImage(drawOptions);
      child.snapshot = snapshot;
      this.renderer.drawImage({ ...drawOptions, image: snapshot });
    }
  }
}
