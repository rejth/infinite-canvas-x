import type { BaseRenderManager, Camera, Renderer } from '@infinite-canvas-x/canvas-engine'
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_OPACITY,
  DEFAULT_RESIZE_DIRECTION,
  DEFAULT_SCALE,
  DEFAULT_ZOOM_PERCENTAGE,
  type LayerInterface,
  type PixelRatio,
  TextAlign,
} from '@infinite-canvas-x/canvas-engine'

import { readLayerBackgroundColor } from './layerUi'
import {
  DEFAULT_CURSOR,
  DEFAULT_FILTERS,
  DEFAULT_TOOL,
  type ImageFilterState,
  type Tool,
} from './types'

type Listener = () => void

export class CanvasAppState {
  private listeners = new Set<Listener>()
  private version = 0

  renderer: Renderer | null = null
  renderManager: BaseRenderManager | null = null
  camera: Camera | null = null

  tool: Tool = DEFAULT_TOOL
  cursor: string = DEFAULT_CURSOR
  resizeDirection: string = DEFAULT_RESIZE_DIRECTION
  zoomPercentage: number = DEFAULT_ZOOM_PERCENTAGE

  activeLayer: LayerInterface | null = null
  lastActiveLayer: LayerInterface | null = null
  opacity: number = DEFAULT_OPACITY
  layerBackgroundColor = ''

  isLayerEditable = false
  text = ''
  textScale: PixelRatio = DEFAULT_SCALE
  textAlign: TextAlign = TextAlign.LEFT
  fontSize: number = DEFAULT_FONT_SIZE
  bold = false
  italic = false
  underline = false

  image: CanvasImageSource | null = null
  filters: ImageFilterState = { ...DEFAULT_FILTERS }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getVersion(): number {
    return this.version
  }

  notify(): void {
    this.version += 1
    for (const listener of this.listeners) {
      listener()
    }
  }

  setTool(tool: Tool): void {
    if (this.tool === tool) return
    this.tool = tool
    this.notify()
  }

  setCursor(cursor: string): void {
    if (this.cursor === cursor) return
    this.cursor = cursor
    this.notify()
  }

  setResizeDirection(direction: string): void {
    if (this.resizeDirection === direction) return
    this.resizeDirection = direction
    this.notify()
  }

  setZoomPercentage(zoomPercentage: number): void {
    this.zoomPercentage = zoomPercentage
    this.notify()
  }

  setActiveLayer(layer: LayerInterface | null): void {
    this.activeLayer = layer
    if (layer) {
      this.opacity = Math.round(layer.getOpacity() * 100)
      this.layerBackgroundColor = readLayerBackgroundColor(layer)
    } else {
      this.layerBackgroundColor = ''
    }
    this.notify()
  }

  setLayerBackgroundColor(color: string): void {
    if (this.layerBackgroundColor === color) return
    this.layerBackgroundColor = color
    this.notify()
  }

  setLastActiveLayer(layer: LayerInterface | null): void {
    this.lastActiveLayer = layer
    this.notify()
  }

  setOpacity(opacity: number): void {
    this.opacity = opacity
    this.notify()
  }

  setIsLayerEditable(isLayerEditable: boolean): void {
    if (this.isLayerEditable === isLayerEditable) return
    this.isLayerEditable = isLayerEditable
    this.notify()
  }

  setText(text: string): void {
    this.text = text
    this.notify()
  }

  setTextScale(textScale: PixelRatio): void {
    this.textScale = textScale
    this.notify()
  }

  setTextAlign(textAlign: TextAlign): void {
    this.textAlign = textAlign
    this.notify()
  }

  setFontSize(fontSize: number): void {
    this.fontSize = fontSize
    this.notify()
  }

  setBold(bold: boolean): void {
    this.bold = bold
    this.notify()
  }

  setItalic(italic: boolean): void {
    this.italic = italic
    this.notify()
  }

  setUnderline(underline: boolean): void {
    this.underline = underline
    this.notify()
  }

  setImage(image: CanvasImageSource | null): void {
    this.image = image
    this.notify()
  }

  setFilters(newFilters: Partial<ImageFilterState>): void {
    this.filters = { ...this.filters, ...newFilters }
    this.notify()
  }

  resetTextEditor(): void {
    this.text = ''
    this.textAlign = TextAlign.LEFT
    this.fontSize = DEFAULT_FONT_SIZE
    this.bold = false
    this.italic = false
    this.underline = false
    this.isLayerEditable = false
    this.notify()
  }

  setTextEditor(text: string): void {
    this.text = text
    this.textAlign = TextAlign.LEFT
    this.fontSize = DEFAULT_FONT_SIZE
    this.bold = false
    this.italic = false
    this.underline = false
    this.isLayerEditable = false
    this.notify()
  }

  resetImageEditor(): void {
    this.image = null
    this.filters = { ...DEFAULT_FILTERS }
    this.notify()
  }
}
