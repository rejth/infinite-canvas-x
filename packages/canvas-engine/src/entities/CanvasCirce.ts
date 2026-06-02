import { BaseCanvasEntity } from './BaseCanvasEntity'
import { BaseDrawOptions, CanvasEntityType } from './interfaces'

export interface CircleDrawOptions extends BaseDrawOptions {
  radius: number
  color: string
  stroke?: boolean
  strokeColor?: string
  lineWidth?: number
}

export class CanvasCircle extends BaseCanvasEntity<CircleDrawOptions> {
  constructor(options: CircleDrawOptions) {
    super(options)
    this.setType(CanvasEntityType.CIRCLE)
  }
}
