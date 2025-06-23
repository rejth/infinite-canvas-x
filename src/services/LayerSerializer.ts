import { Layer } from '@/entities/Layer';

import { CanvasRect, RectDrawOptions } from '@/entities/CanvasRect';
import { CanvasText, TextDrawOptions } from '@/entities/CanvasText';
import { BaseCanvasEntityInterface, BaseDrawOptions, CanvasEntityType, LayerInterface } from '@/entities/interfaces';

export type SerializedLayer<T extends BaseDrawOptions = BaseDrawOptions> = {
  type: CanvasEntityType;
  options: T;
  children: SerializedCanvasObject<T>[];
};

export type SerializedCanvasObject<T extends BaseDrawOptions = BaseDrawOptions> = {
  type: CanvasEntityType;
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

  static serialize(layer: LayerInterface): SerializedLayer | null {
    if (layer.getType() === CanvasEntityType.LAYER) {
      return this.#serializeLayer(layer);
    }

    return null;
  }

  static deserialize(serializedLayer: SerializedLayer): Layer | null {
    if (serializedLayer.type === CanvasEntityType.LAYER) {
      return this.#deserializeLayer(serializedLayer);
    }

    return null;
  }

  static #serializeLayer(layer: LayerInterface): SerializedLayer {
    const data: SerializedLayer = {
      type: layer.getType(),
      options: layer.getOptions(),
      children: [],
    };

    for (const child of layer.getChildren()) {
      data.children.push(this.#serializeCanvasObject(child));
    }

    return data;
  }

  static #deserializeLayer(serializedLayer: SerializedLayer): Layer {
    const layer = new Layer(serializedLayer.options);

    for (const child of serializedLayer.children) {
      if (isSerializedEntityRect(child)) {
        layer.addChild(new CanvasRect(child.options));
      }
      if (isSerializedEntityText(child)) {
        layer.addChild(new CanvasText(child.options));
      }
    }

    return layer;
  }

  static #serializeCanvasObject(canvasObject: BaseCanvasEntityInterface): SerializedCanvasObject {
    return {
      type: canvasObject.getType(),
      options: canvasObject.getOptions(),
      minDimension: canvasObject.getMinDimension(),
    };
  }
}
