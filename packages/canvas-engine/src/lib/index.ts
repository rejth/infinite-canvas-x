import { CanvasCircle } from '../entities/CanvasCirce'
import { CanvasImage } from '../entities/CanvasImage'
import { CanvasRect } from '../entities/CanvasRect'
import { CanvasSpline } from '../entities/CanvasSpline'
import { CanvasText } from '../entities/CanvasText'
import {
  BaseCanvasEntityInterface,
  BaseDrawOptions,
  CanvasEntityType,
} from '../entities/interfaces'
import { Selection } from '../entities/Selection'

export function setByPath(object: Record<string, unknown>, path: string, value: unknown) {
  path.split('.').forEach((property, i, array) => {
    if (i === array.length - 1) {
      object[property] = value
    } else {
      if (typeof object[property] !== 'object' || object[property] === null) {
        object[property] = {}
      }
      object = object[property] as Record<string, unknown>
    }
  })
}

export const getImageBitmap = async (imageUrl: string): Promise<ImageBitmap> => {
  const response = await fetch(imageUrl)
  const blob = await response.blob()
  return createImageBitmap(blob)
}

export const createCursorFromImage = async (imageUrl: string): Promise<string> => {
  const size = 32 // browsers limit cursor sizes to 32x32px maximum

  const imageBitmap = await getImageBitmap(imageUrl)
  const imageCanvas = new OffscreenCanvas(size, size)
  const imageCtx = imageCanvas.getContext('2d')!

  imageCtx.drawImage(imageBitmap, 0, 0, size, size)
  const blob = await imageCanvas.convertToBlob({ type: 'image/png' })

  return URL.createObjectURL(blob)
}

export function isCanvasRect(
  entity: BaseCanvasEntityInterface<BaseDrawOptions>,
): entity is CanvasRect {
  return entity.getType() === CanvasEntityType.RECT
}

export function isCanvasText(
  entity: BaseCanvasEntityInterface<BaseDrawOptions>,
): entity is CanvasText {
  return entity.getType() === CanvasEntityType.TEXT
}

export function isCanvasImage(
  entity: BaseCanvasEntityInterface<BaseDrawOptions>,
): entity is CanvasImage {
  return entity.getType() === CanvasEntityType.IMAGE
}

export function isCanvasSelection(
  entity: BaseCanvasEntityInterface<BaseDrawOptions>,
): entity is Selection {
  return entity.getType() === CanvasEntityType.SELECTION
}

export function isCanvasCircle(
  entity: BaseCanvasEntityInterface<BaseDrawOptions>,
): entity is CanvasCircle {
  return entity.getType() === CanvasEntityType.CIRCLE
}

export function isCanvasSpline(
  entity: BaseCanvasEntityInterface<BaseDrawOptions>,
): entity is CanvasSpline {
  return entity.getType() === CanvasEntityType.SPLINE
}
