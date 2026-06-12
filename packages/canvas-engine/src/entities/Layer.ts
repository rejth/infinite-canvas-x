import {
  DEFAULT_RECT_SIZE,
  DEFAULT_RESIZE_DIRECTION,
  DEFAULT_SCALE,
  DEFAULT_SELECTION_LINE_WIDTH,
  SMALL_PADDING,
} from '../constants'
import { Colors, LayerId, type RectDimension } from '../interfaces'

import { BaseCanvasEntity } from './BaseCanvasEntity'
import {
  BaseCanvasEntityInterface,
  BaseDrawOptions,
  CanvasEntityType,
  LayerInterface,
} from './interfaces'
import { Selection } from './Selection'

export interface LayerSettings {
  id?: LayerId | null
  withSelection?: boolean
  minDimension?: number
}

const DEFAULT_LAYER_SETTINGS: LayerSettings = {
  id: null,
  withSelection: true,
  minDimension: DEFAULT_RECT_SIZE,
}

export class Layer extends BaseCanvasEntity<BaseDrawOptions> implements LayerInterface {
  private id: LayerId | null = null
  private active = false
  private readonly children: Array<BaseCanvasEntityInterface<BaseDrawOptions>> = []

  private needToRender = true

  constructor(options: BaseDrawOptions, settings = DEFAULT_LAYER_SETTINGS) {
    super(options, settings.minDimension)

    this.setId(settings.id ?? null)
    this.setType(CanvasEntityType.LAYER)

    if (settings.withSelection) {
      this.children.push(
        new Selection({
          ...options,
          lineWidth: DEFAULT_SELECTION_LINE_WIDTH,
          scale: DEFAULT_SCALE,
          color: Colors.SELECTION,
        }),
      )
    }
  }

  setActive(state: boolean) {
    this.active = state
  }

  isActive() {
    return this.active
  }

  setId(id: LayerId | null) {
    this.id = id
  }

  getId(): LayerId | null {
    return this.id
  }

  addChild<T extends BaseDrawOptions>(child: BaseCanvasEntityInterface<T>) {
    this.children.push(child)
    this.syncSelectionBounds()
  }

  getContentBounds(): RectDimension | null {
    const contentChildren = this.children.filter(
      (child) => child.getType() !== CanvasEntityType.SELECTION,
    )

    if (contentChildren.length === 0) {
      return null
    }

    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY

    for (const child of contentChildren) {
      const { x, y, width, height } = child.getOptions()
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + width)
      maxY = Math.max(maxY, y + height)
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    }
  }

  syncSelectionFromBounds(bounds: RectDimension, padding = SMALL_PADDING) {
    const paddedX = bounds.x - padding
    const paddedY = bounds.y - padding
    const paddedWidth = bounds.width + padding * 2
    const paddedHeight = bounds.height + padding * 2
    const selection = this.getChildByType(CanvasEntityType.SELECTION)

    if (selection) {
      selection.setXY(paddedX, paddedY)
      selection.setWidthHeight(paddedWidth, paddedHeight)
    }

    this.setXY(paddedX, paddedY)
    this.setWidthHeight(paddedWidth, paddedHeight)
  }

  syncSelectionBounds(padding = SMALL_PADDING) {
    const bounds = this.getContentBounds()
    if (!bounds) {
      return
    }

    this.syncSelectionFromBounds(bounds, padding)
  }

  getChildren<T extends BaseDrawOptions>(): Array<BaseCanvasEntityInterface<T>> {
    return this.children as Array<BaseCanvasEntityInterface<T>>
  }

  move(movementX: number, movementY: number) {
    this.moveChildrenAccordingly(movementX, movementY)
    this.syncSelectionBounds()
  }

  moveChildrenAccordingly(movementX: number, movementY: number) {
    for (const child of this.children) {
      if (child.getType() === CanvasEntityType.SELECTION) {
        continue
      }
      child.move(movementX, movementY)
    }
  }

  resize(movementX: number, movementY: number, direction = DEFAULT_RESIZE_DIRECTION) {
    if (['top-left', 'top', 'left'].includes(direction)) {
      this.resizeTopLeft(movementX, movementY)
    } else if (direction === 'top-right') {
      this.resizeTopRight(movementX, movementY)
    } else if (direction === 'bottom-left') {
      this.resizeBottomLeft(movementX, movementY)
    } else if (['bottom-right', 'right', 'bottom'].includes(direction)) {
      this.resizeBottomRight(movementX, movementY)
    }
  }

  resizeBottomRight(movementX: number, movementY: number) {
    const { width, height } = this.getOptions()
    const delta = movementX + movementY
    const movement = (Math.abs(movementX) + Math.abs(movementY)) / 2

    if (delta < 0) {
      this.setWidthHeight(width - movement, height - movement)
      this.resizeChildrenAccordingly(-movement, -movement)
    } else {
      this.setWidthHeight(width + movement, height + movement)
      this.resizeChildrenAccordingly(movement, movement)
    }
    this.syncSelectionBounds()
  }

  resizeBottomLeft(movementX: number, movementY: number) {
    const { width, height } = this.getOptions()
    const delta = movementX
    const movement = (Math.abs(movementX) + Math.abs(movementY)) / 2
    const minDimension = this.getMinDimension()

    if (delta < 0) {
      this.move(-movement, 0)
      this.setWidthHeight(width + movement, height + movement)
      this.resizeChildrenAccordingly(movement, movement)
    } else {
      if (width - movement > minDimension && height - movement > minDimension) {
        this.move(movement, 0)
        this.setWidthHeight(width - movement, height - movement)
        this.resizeChildrenAccordingly(-movement, -movement)
      }
    }
    this.syncSelectionBounds()
  }

  resizeTopRight(movementX: number, movementY: number) {
    const { width, height } = this.getOptions()
    const delta = movementY
    const movement = (Math.abs(movementX) + Math.abs(movementY)) / 2
    const minDimension = this.getMinDimension()

    if (delta < 0) {
      this.move(0, -movement)
      this.setWidthHeight(width + movement, height + movement)
      this.resizeChildrenAccordingly(movement, movement)
    } else {
      if (width - movement > minDimension && height - movement > minDimension) {
        this.move(0, movement)
        this.setWidthHeight(width - movement, height - movement)
        this.resizeChildrenAccordingly(-movement, -movement)
      }
    }
    this.syncSelectionBounds()
  }

  resizeTopLeft(movementX: number, movementY: number) {
    const { width, height } = this.getOptions()
    const delta = movementX + movementY
    const movement = (Math.abs(movementX) + Math.abs(movementY)) / 2

    const minDimension = this.getMinDimension()

    if (delta < 0) {
      this.move(-movement, -movement)
      this.resizeChildrenAccordingly(movement, movement)
      this.setWidthHeight(width + movement, height + movement)
    } else {
      if (width - movement > minDimension && height - movement > minDimension) {
        this.move(movement, movement)
        this.resizeChildrenAccordingly(-movement, -movement)
        this.setWidthHeight(width - movement, height - movement)
      }
    }
    this.syncSelectionBounds()
  }

  resizeChildrenAccordingly(movementX: number, movementY: number) {
    for (const child of this.children) {
      if (child.getType() === CanvasEntityType.SELECTION) {
        continue
      }
      child.resize(movementX, movementY)
    }
  }

  containsChildWithType(type: CanvasEntityType) {
    return this.children.some((child) => child.getType() === type)
  }

  getChildByType<T extends BaseDrawOptions>(
    type: CanvasEntityType,
  ): BaseCanvasEntityInterface<T> | null {
    return (
      (this.children as BaseCanvasEntityInterface<T>[]).find((child) => child.getType() === type) ??
      null
    )
  }

  setShouldBeRendered(shouldRender: boolean) {
    this.needToRender = shouldRender
  }

  shouldBeRendered(): boolean {
    return this.needToRender
  }
}
