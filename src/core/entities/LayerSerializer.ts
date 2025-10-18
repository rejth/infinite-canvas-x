import { LayerId } from '@/core/interfaces';

import { Layer } from '@/core/entities/Layer';
import { CanvasRect, RectDrawOptions } from '@/core/entities/CanvasRect';
import { CanvasText, TextDrawOptions } from '@/core/entities/CanvasText';
import {
  BaseCanvasEntityInterface,
  BaseDrawOptions,
  CanvasEntitySubtype,
  CanvasEntityType,
  LayerInterface,
} from '@/core/entities/interfaces';

import { isCanvasImage, isCanvasSpline } from './lib';

export type SerializedLayer<T extends BaseDrawOptions = BaseDrawOptions> = {
  id: LayerId | null;
  type: CanvasEntityType;
  subtype: CanvasEntitySubtype | null;
  options: T;
  children: SerializedCanvasObject<T>[];
};

export type SerializedCanvasObject<T extends BaseDrawOptions = BaseDrawOptions> = {
  type: CanvasEntityType;
  subtype: CanvasEntitySubtype | null;
  options: T;
  minDimension: number;
};

const isSerializedEntityRect = (
  serializedEntity: SerializedCanvasObject,
): serializedEntity is SerializedCanvasObject<RectDrawOptions> => {
  return serializedEntity.type === CanvasEntityType.RECT;
};

const isSerializedEntityText = (
  serializedEntity: SerializedCanvasObject,
): serializedEntity is SerializedCanvasObject<TextDrawOptions> => {
  return serializedEntity.type === CanvasEntityType.TEXT;
};

export class LayerSerializer {
  private constructor() {}

  static serialize(layer: LayerInterface | null): SerializedLayer | null {
    if (!layer) {
      return null;
    }

    if (layer.getType() === CanvasEntityType.LAYER) {
      return this.serializeLayer(layer);
    }

    return null;
  }

  static deserialize(serializedLayer: SerializedLayer): LayerInterface | null {
    if (serializedLayer.type === CanvasEntityType.LAYER) {
      return this.deserializeLayer(serializedLayer);
    }

    return null;
  }

  private static serializeLayer(layer: LayerInterface): SerializedLayer | null {
    const data: SerializedLayer = {
      id: layer.getId(),
      type: layer.getType(),
      subtype: layer.getSubtype(),
      options: layer.getOptions(),
      children: [],
    };
    const children = layer.getChildren();

    if (children.some(isCanvasSpline)) {
      return null;
    }
    if (children.some(isCanvasImage)) {
      return null;
    }
    for (const child of children) {
      data.children.push(this.serializeCanvasObject(child));
    }

    return data;
  }

  private static deserializeLayer(serializedLayer: SerializedLayer): LayerInterface {
    const layer = new Layer(serializedLayer.options, {
      id: serializedLayer.id,
      withSelection: true,
    });

    for (const child of serializedLayer.children) {
      if (isSerializedEntityRect(child)) {
        layer.addChild(new CanvasRect(child.options, child.subtype));
      }
      if (isSerializedEntityText(child)) {
        layer.addChild(new CanvasText(child.options));
      }
    }

    return layer;
  }

  private static serializeCanvasObject(canvasObject: BaseCanvasEntityInterface): SerializedCanvasObject {
    return {
      type: canvasObject.getType(),
      subtype: canvasObject.getSubtype(),
      options: canvasObject.getOptions(),
      minDimension: canvasObject.getMinDimension(),
    };
  }
}
