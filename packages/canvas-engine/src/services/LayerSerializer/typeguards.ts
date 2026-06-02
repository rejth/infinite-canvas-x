import { RectDrawOptions } from '../../entities/CanvasRect'
import { TextDrawOptions } from '../../entities/CanvasText'
import { CanvasEntityType } from '../../entities/interfaces'

import { SerializedCanvasObject } from './types'

export const isSerializedEntityRect = (
  serializedEntity: SerializedCanvasObject,
): serializedEntity is SerializedCanvasObject<RectDrawOptions> => {
  return serializedEntity.type === CanvasEntityType.RECT
}

export const isSerializedEntityText = (
  serializedEntity: SerializedCanvasObject,
): serializedEntity is SerializedCanvasObject<TextDrawOptions> => {
  return serializedEntity.type === CanvasEntityType.TEXT
}
