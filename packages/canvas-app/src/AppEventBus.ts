import type { DoubleClickDetail } from './types'
import { CustomEvents } from './types'

type DoubleClickHandler = (detail: DoubleClickDetail) => void
type VoidHandler = () => void

export class AppEventBus {
  private doubleClickHandlers = new Set<DoubleClickHandler>()
  private zoomingStoppedHandlers = new Set<VoidHandler>()

  onDoubleClick(handler: DoubleClickHandler): () => void {
    this.doubleClickHandlers.add(handler)
    return () => this.doubleClickHandlers.delete(handler)
  }

  onZoomingStopped(handler: VoidHandler): () => void {
    this.zoomingStoppedHandlers.add(handler)
    return () => this.zoomingStoppedHandlers.delete(handler)
  }

  emitDoubleClick(detail: DoubleClickDetail): void {
    window.dispatchEvent(new CustomEvent(CustomEvents.DOUBLE_CLICK, { detail }))
    for (const handler of this.doubleClickHandlers) {
      handler(detail)
    }
  }

  emitZoomingStopped(): void {
    document.dispatchEvent(new CustomEvent(CustomEvents.ZOOMING_STOPPED))
    for (const handler of this.zoomingStoppedHandlers) {
      handler()
    }
  }
}
