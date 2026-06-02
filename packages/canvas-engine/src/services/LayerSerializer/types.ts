import { BaseDrawOptions, CanvasEntitySubtype, CanvasEntityType } from '../../entities/interfaces'
import { LayerId } from '../../interfaces'

export type SerializedLayer<T extends BaseDrawOptions = BaseDrawOptions> = {
  id: LayerId | null
  type: CanvasEntityType
  subtype: CanvasEntitySubtype | null
  options: T
  children: SerializedCanvasObject<T>[]
}

export type SerializedCanvasObject<T extends BaseDrawOptions = BaseDrawOptions> = {
  type: CanvasEntityType
  subtype: CanvasEntitySubtype | null
  options: T
  minDimension: number
}
