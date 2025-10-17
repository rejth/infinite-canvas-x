import { Colors, LayerId } from '@/core/interfaces';
import {
  DEFAULT_RECT_SIZE,
  DEFAULT_RESIZE_DIRECTION,
  DEFAULT_SCALE,
  DEFAULT_SELECTION_LINE_WIDTH,
} from '@/core/constants';

import {
  BaseDrawOptions,
  BaseCanvasEntityInterface,
  CanvasEntityType,
  LayerInterface,
} from '@/core/entities/interfaces';
import { BaseCanvasEntity } from '@/core/entities/BaseCanvasEntity';
import { Selection } from '@/core/entities/Selection';

export interface LayerSettings {
  id?: LayerId | null;
  withSelection?: boolean;
  minDimension?: number;
}

const DEFAULT_LAYER_SETTINGS: LayerSettings = {
  id: null,
  withSelection: true,
  minDimension: DEFAULT_RECT_SIZE,
};

export class Layer extends BaseCanvasEntity<BaseDrawOptions> implements LayerInterface {
  private id: LayerId | null = null;
  private active = false;
  private readonly children: Array<BaseCanvasEntityInterface<BaseDrawOptions>> = [];

  private needToRender = true;

  constructor(options: BaseDrawOptions, settings = DEFAULT_LAYER_SETTINGS) {
    super(options, settings.minDimension);

    this.setId(settings.id ?? null);
    this.setType(CanvasEntityType.LAYER);

    if (settings.withSelection) {
      this.children.push(
        new Selection({
          ...options,
          lineWidth: DEFAULT_SELECTION_LINE_WIDTH,
          scale: DEFAULT_SCALE,
          color: Colors.SELECTION,
        }),
      );
    }
  }

  setActive(state: boolean) {
    this.active = state;
  }

  isActive() {
    return this.active;
  }

  setId(id: LayerId | null) {
    this.id = id;
  }

  getId(): LayerId | null {
    return this.id;
  }

  addChild<T extends BaseDrawOptions>(child: BaseCanvasEntityInterface<T>) {
    this.children.push(child);
  }

  getChildren<T extends BaseDrawOptions>(): Array<BaseCanvasEntityInterface<T>> {
    return this.children as Array<BaseCanvasEntityInterface<T>>;
  }

  move(movementX: number, movementY: number) {
    const { x, y } = this.getOptions();
    const layerX = x + movementX;
    const layerY = y + movementY;

    this.setXY(layerX, layerY);
    this.moveChildrenAccordingly(movementX, movementY);
  }

  moveChildrenAccordingly(movementX: number, movementY: number) {
    for (const child of this.children) {
      child.move(movementX, movementY);
    }
  }

  resize(movementX: number, movementY: number, direction = DEFAULT_RESIZE_DIRECTION) {
    if (['top-left', 'top', 'left'].includes(direction)) {
      this.resizeTopLeft(movementX, movementY);
    } else if (direction === 'top-right') {
      this.resizeTopRight(movementX, movementY);
    } else if (direction === 'bottom-left') {
      this.resizeBottomLeft(movementX, movementY);
    } else if (['bottom-right', 'right', 'bottom'].includes(direction)) {
      this.resizeBottomRight(movementX, movementY);
    }
  }

  resizeBottomRight(movementX: number, movementY: number) {
    const { width, height } = this.getOptions();
    const delta = movementX + movementY;
    const movement = (Math.abs(movementX) + Math.abs(movementY)) / 2;

    if (delta < 0) {
      this.setWidthHeight(width - movement, height - movement);
      this.resizeChildrenAccordingly(-movement, -movement);
    } else {
      this.setWidthHeight(width + movement, height + movement);
      this.resizeChildrenAccordingly(movement, movement);
    }
  }

  resizeBottomLeft(movementX: number, movementY: number) {
    const { width, height } = this.getOptions();
    const delta = movementX;
    const movement = (Math.abs(movementX) + Math.abs(movementY)) / 2;
    const minDimension = this.getMinDimension();

    if (delta < 0) {
      this.move(-movement, 0);
      this.setWidthHeight(width + movement, height + movement);
      this.resizeChildrenAccordingly(movement, movement);
    } else {
      if (width - movement > minDimension && height - movement > minDimension) {
        this.move(movement, 0);
        this.setWidthHeight(width - movement, height - movement);
        this.resizeChildrenAccordingly(-movement, -movement);
      }
    }
  }

  resizeTopRight(movementX: number, movementY: number) {
    const { width, height } = this.getOptions();
    const delta = movementY;
    const movement = (Math.abs(movementX) + Math.abs(movementY)) / 2;
    const minDimension = this.getMinDimension();

    if (delta < 0) {
      this.move(0, -movement);
      this.setWidthHeight(width + movement, height + movement);
      this.resizeChildrenAccordingly(movement, movement);
    } else {
      if (width - movement > minDimension && height - movement > minDimension) {
        this.move(0, movement);
        this.setWidthHeight(width - movement, height - movement);
        this.resizeChildrenAccordingly(-movement, -movement);
      }
    }
  }

  resizeTopLeft(movementX: number, movementY: number) {
    const { width, height } = this.getOptions();
    const delta = movementX + movementY;
    const movement = (Math.abs(movementX) + Math.abs(movementY)) / 2;

    const minDimension = this.getMinDimension();

    if (delta < 0) {
      this.move(-movement, -movement);
      this.resizeChildrenAccordingly(movement, movement);
      this.setWidthHeight(width + movement, height + movement);
    } else {
      if (width - movement > minDimension && height - movement > minDimension) {
        this.move(movement, movement);
        this.resizeChildrenAccordingly(-movement, -movement);
        this.setWidthHeight(width - movement, height - movement);
      }
    }
  }

  resizeChildrenAccordingly(movementX: number, movementY: number) {
    for (const child of this.children) {
      child.resize(movementX, movementY);
    }
  }

  containsChildWithType(type: CanvasEntityType) {
    return this.children.some((child) => child.getType() === type);
  }

  getChildByType<T extends BaseDrawOptions>(type: CanvasEntityType): BaseCanvasEntityInterface<T> | null {
    return (this.children as BaseCanvasEntityInterface<T>[]).find((child) => child.getType() === type) ?? null;
  }

  setShouldBeRendered(shouldRender: boolean) {
    this.needToRender = shouldRender;
  }

  shouldBeRendered(): boolean {
    return this.needToRender;
  }
}
