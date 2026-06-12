import type { BaseRenderManager, Camera, Renderer } from '@infinite-canvas-x/canvas-engine'
import {
  CanvasEntitySubtype,
  CanvasEntityType,
  isCanvasImage,
  isCanvasRect,
  isCanvasSelection,
  isCanvasSpline,
  isCanvasText,
  type LayerInterface,
  LayerSerializer,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
} from '@infinite-canvas-x/canvas-engine'

import { AppEventBus } from './AppEventBus'
import { CanvasAppState } from './CanvasAppState'
import { saveTextWithRenderer } from './text/saveText'
import { createImage } from './tools/createImage'
import { createSticker } from './tools/createSticker'
import { createTextArea } from './tools/createTextArea'
import { selectTool } from './tools/selectTool'
import { DEFAULT_CURSOR, type ImageFilterState, Tools } from './types'

export class CanvasApp {
  readonly state = new CanvasAppState()
  readonly events = new AppEventBus()

  private wheelTimerId: ReturnType<typeof setTimeout> | null = null
  private clipboard: LayerInterface | null = null
  private commandPressed = false

  private constructor(renderer: Renderer, renderManager: BaseRenderManager, camera: Camera) {
    this.state.renderer = renderer
    this.state.renderManager = renderManager
    this.state.camera = camera

    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
  }

  /** Builds a CanvasApp instance. Call `attachKeyboardListeners()` when the host UI mounts. */
  static create(renderer: Renderer, renderManager: BaseRenderManager, camera: Camera): CanvasApp {
    return new CanvasApp(renderer, renderManager, camera)
  }

  getRenderer(): Renderer | null {
    return this.state.renderer
  }

  getRenderManager(): BaseRenderManager | null {
    return this.state.renderManager
  }

  getCamera(): Camera | null {
    return this.state.camera
  }

  destroy(): void {
    this.detachKeyboardListeners()
    if (this.wheelTimerId) {
      clearTimeout(this.wheelTimerId)
    }
  }

  handlePointerDown(e: MouseEvent): void {
    const { camera } = this.state
    if (!camera) return

    camera.handleMouseDown(e)
    this.cacheControlPoint(e)

    e.preventDefault()
    const currentTransformedPosition = camera.handleClick(e)
    const { tool, image } = this.state

    if (tool === Tools.STICKER) {
      createSticker(this.state, currentTransformedPosition, this.openTextEditor.bind(this), e)
    } else if (tool === Tools.TEXT) {
      createTextArea(this.state, currentTransformedPosition, this.openTextEditor.bind(this), e)
    } else if (tool === Tools.IMAGE && image instanceof ImageBitmap) {
      createImage(this.state, currentTransformedPosition, image)
    } else if (tool === Tools.SELECT) {
      const { renderManager } = this.state
      if (renderManager) {
        selectTool(this.state, renderManager, currentTransformedPosition, () =>
          saveTextWithRenderer(this.state),
        )
      }
    }
  }

  handlePointerMove(e: MouseEvent): void {
    const { renderManager, camera, activeLayer, tool, resizeDirection } = this.state
    if (!camera || !renderManager) return

    if (activeLayer) {
      if (!camera.isDragging) {
        const { x, y } = camera.handleClick(e)
        const selection = activeLayer.getChildByType(CanvasEntityType.SELECTION)

        if (selection && isCanvasSelection(selection)) {
          const corner = selection.isPointInCorner(x, y)
          const side = selection.isPointInStroke(x, y)

          if (corner) {
            if (['top-left', 'bottom-right'].includes(corner)) {
              this.state.setCursor('nwse-resize')
            } else if (['top-right', 'bottom-left'].includes(corner)) {
              this.state.setCursor('nesw-resize')
            }
            this.state.setResizeDirection(corner)
            if (tool === Tools.SELECT || tool === Tools.RESIZER) {
              this.state.setTool(Tools.RESIZER)
            }
          } else if (side) {
            if (['top', 'bottom'].includes(side)) {
              this.state.setCursor('ns-resize')
            } else if (['left', 'right'].includes(side)) {
              this.state.setCursor('ew-resize')
            }
            this.state.setResizeDirection(side)
            if (tool === Tools.SELECT || tool === Tools.RESIZER) {
              this.state.setTool(Tools.RESIZER)
            }
          } else {
            this.state.setCursor(DEFAULT_CURSOR)
            if (tool === Tools.RESIZER) {
              this.state.setTool(Tools.SELECT)
            }
          }
        }
      } else if (tool === Tools.SELECT) {
        if (this.state.isLayerEditable) {
          this.state.setIsLayerEditable(false)
        }

        const spline = activeLayer.getChildByType(CanvasEntityType.SPLINE)

        if (spline && isCanvasSpline(spline)) {
          this.state.setCursor('crosshair')

          const { x, y } = camera.handleClick(e)
          const wasDragged = spline.continueControlPointDrag({
            x: x + e.movementX,
            y: y + e.movementY,
          })

          if (wasDragged) {
            renderManager.setLayerSize(activeLayer, spline.mbr)
          }
        } else {
          renderManager.moveLayer(activeLayer, e.movementX, e.movementY)
        }
      } else if (tool === Tools.RESIZER) {
        if (this.state.isLayerEditable) {
          this.state.setIsLayerEditable(false)
        }
        renderManager.resizeLayer(activeLayer, e.movementX, e.movementY, resizeDirection)
      }
    }

    if (camera.isDragging && tool === Tools.HAND) {
      camera.handleMouseMove(e)
      renderManager.reDrawOnNextFrame()
    }
  }

  handlePointerUp(): void {
    this.state.camera?.handleMouseUp()
    this.stopCacheControlPoint()
  }

  handleWheel(e: WheelEvent): void {
    const { renderManager, camera, isLayerEditable } = this.state
    if (!renderManager || !camera || isLayerEditable) return

    camera.handleWheelChange(e)

    if (this.wheelTimerId) {
      clearTimeout(this.wheelTimerId)
      this.wheelTimerId = null
    }

    if (e.ctrlKey) {
      const { isZoomed, nextZoomPercentage } = camera.zoomCanvas(e)

      if (isZoomed) {
        this.state.setZoomPercentage(nextZoomPercentage)
        renderManager.reDrawSync()
      }
    } else {
      const isMoved = camera.moveCanvas(e)

      if (isMoved) {
        renderManager.reDrawOnNextFrame()
      }
    }

    this.wheelTimerId = setTimeout(() => {
      camera.handleDragStopped()
      this.events.emitZoomingStopped()
    }, 250)
  }

  handleDoubleClick(e: MouseEvent, layer?: LayerInterface): void {
    e.preventDefault()

    const currentActiveLayer = layer ?? this.state.activeLayer
    const { camera, renderManager } = this.state
    if (!currentActiveLayer || !renderManager || !camera) return

    const { x, y } = camera.handleClick(e)

    this.events.emitDoubleClick({
      pageX: e.pageX,
      pageY: e.pageY,
      transformedPageX: x,
      transformedPageY: y,
      layer: currentActiveLayer,
    })

    this.state.setIsLayerEditable(true)
    renderManager.reDrawSync({ exceptLayer: currentActiveLayer })
    renderManager.drawLayer(currentActiveLayer, { exceptType: CanvasEntityType.TEXT })
  }

  zoomWithStep(step: number, edge: number): void {
    const { renderManager, camera, activeLayer, zoomPercentage } = this.state
    if (!renderManager || !camera) return

    const { isZoomed, nextZoomPercentage } = camera.zoomCanvasWithStep(
      zoomPercentage,
      step,
      edge,
      activeLayer,
    )

    if (isZoomed) {
      renderManager.reDrawOnNextFrame({ forceRender: true })
      this.state.setZoomPercentage(nextZoomPercentage)
    }
  }

  zoomIn(): void {
    this.zoomWithStep(ZOOM_STEP, ZOOM_MAX)
  }

  zoomOut(): void {
    this.zoomWithStep(-ZOOM_STEP, ZOOM_MIN)
  }

  setActiveLayerBackgroundColor(color: string): void {
    const { activeLayer, renderManager } = this.state
    if (!activeLayer || !renderManager) return

    const rect = activeLayer.getChildByType(CanvasEntityType.RECT)
    if (!rect || !isCanvasRect(rect)) return

    rect.setOptions({ color })
    this.state.setLayerBackgroundColor(color)

    renderManager.reDrawOnNextFrame({
      exceptLayer: activeLayer,
      callBack: () => {
        renderManager.drawLayer(activeLayer, { exceptType: CanvasEntityType.TEXT })
      },
    })
  }

  setActiveLayerOpacityPercent(opacity: number): void {
    const { activeLayer, renderManager } = this.state
    if (!activeLayer || !renderManager) return

    activeLayer.setOpacity(opacity / 100)
    this.state.setOpacity(opacity)
    renderManager.reDrawOnNextFrame()
  }

  applyActiveImageFilter(key: keyof ImageFilterState, value: number): void {
    const { activeLayer, renderManager } = this.state
    if (!activeLayer || !renderManager) return

    const activeImage = activeLayer.getChildByType(CanvasEntityType.IMAGE)
    if (!activeImage || !isCanvasImage(activeImage)) return

    activeImage.applyFilters({ [key]: value })
    this.state.setFilters({ [key]: value })
    renderManager.reDrawOnNextFrame()
  }

  transformActiveTextToSpline(): void {
    const { activeLayer, renderManager, text } = this.state
    if (!activeLayer || !renderManager) return

    const rect = activeLayer.getChildByType(CanvasEntityType.RECT)
    const isTextArea = rect && isCanvasRect(rect) && rect.getSubtype() === CanvasEntitySubtype.TEXT
    if (!isTextArea || !rect || !isCanvasRect(rect)) return

    const textChild = activeLayer.getChildByType(CanvasEntityType.TEXT)
    const renderedText =
      textChild && isCanvasText(textChild) ? textChild.getOptions().text : undefined
    const finalText = renderedText || text
    if (!finalText) return

    const newLayer = rect.enableTextTransformation(finalText)
    renderManager.removeLayer(activeLayer)
    renderManager.addLayer(newLayer)

    this.state.resetTextEditor()
    this.state.setActiveLayer(newLayer)
    this.state.setTool(Tools.SELECT)
  }

  removeActiveLayer(): void {
    const { renderManager, activeLayer } = this.state
    if (!activeLayer || !renderManager) return

    renderManager.removeLayer(activeLayer)
    this.resetActiveLayer()
  }

  resetActiveLayer(): void {
    const { activeLayer } = this.state
    if (this.state.isLayerEditable) {
      saveTextWithRenderer(this.state)
      this.state.renderManager?.reDrawOnNextFrame()
    }
    this.state.resetTextEditor()
    this.state.setLastActiveLayer(activeLayer)
    this.state.setActiveLayer(null)
    activeLayer?.setActive(false)
  }

  selectToolbarTool(tool: import('./types').Tool, handCursor?: string): void {
    this.state.setTool(tool)

    if (tool === Tools.DELETE) {
      this.removeActiveLayer()
      this.state.setTool(Tools.SELECT)
    } else if (this.state.activeLayer) {
      this.resetActiveLayer()
      this.state.renderManager?.reDrawOnNextFrame()
    }

    if (tool === Tools.HAND && handCursor) {
      this.state.setCursor(handCursor)
    } else {
      this.state.setCursor(DEFAULT_CURSOR)
    }
  }

  deselectActiveLayer(): void {
    const { activeLayer, renderManager } = this.state
    if (!activeLayer) return

    saveTextWithRenderer(this.state)
    activeLayer.setActive(false)
    this.state.resetTextEditor()
    this.state.setActiveLayer(null)
    renderManager?.reDrawOnNextFrame()
  }

  private openTextEditor(e: MouseEvent, layer: LayerInterface): void {
    this.handleDoubleClick(e, layer)
  }

  private cacheControlPoint(e: MouseEvent): void {
    const { camera, tool, activeLayer } = this.state
    if (tool === Tools.SELECT && activeLayer && camera) {
      const spline = activeLayer.getChildByType(CanvasEntityType.SPLINE)
      if (spline && isCanvasSpline(spline)) {
        const { x, y } = camera.handleClick(e)
        spline.startControlPointDrag(x, y)
      }
    }
  }

  private stopCacheControlPoint(): void {
    const { activeLayer } = this.state
    if (!activeLayer) return

    const spline = activeLayer.getChildByType(CanvasEntityType.SPLINE)
    if (spline && isCanvasSpline(spline)) {
      spline.stopControlPointDrag()
    }
  }

  /** Registers document keyboard listeners. Pair with `destroy()` on UI teardown. */
  attachKeyboardListeners(): void {
    this.detachKeyboardListeners()
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
  }

  private detachKeyboardListeners(): void {
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('keyup', this.handleKeyUp)
  }

  private handleKeyUp(): void {
    this.commandPressed = false
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const target = e.target
    if (
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLInputElement ||
      (target instanceof HTMLElement && target.isContentEditable)
    ) {
      return
    }

    const { renderManager, activeLayer, isLayerEditable } = this.state

    if (e.key === 'Escape') {
      if (activeLayer) {
        saveTextWithRenderer(this.state)
        activeLayer.setActive(false)
        this.state.setLastActiveLayer(activeLayer)
        this.state.resetTextEditor()
        this.state.setActiveLayer(null)
        renderManager?.reDrawOnNextFrame()
      }
      return
    }

    if (e.key === 'Meta') {
      this.commandPressed = true
      return
    }

    if (e.key === 'Backspace') {
      if (activeLayer && !isLayerEditable) {
        renderManager?.removeLayer(activeLayer)
        this.state.setLastActiveLayer(activeLayer)
        this.state.setActiveLayer(null)
      }
      return
    }

    if (e.key === 'c') {
      if ((this.commandPressed || e.ctrlKey) && activeLayer && !isLayerEditable) {
        this.clipboard = activeLayer
      }
      return
    }

    if (e.key === 'v') {
      if ((this.commandPressed || e.ctrlKey) && this.clipboard) {
        if (activeLayer) {
          activeLayer.setActive(false)
        }

        const data = LayerSerializer.serialize(this.clipboard)
        if (data) {
          const layerCopy = LayerSerializer.deserialize(data)
          if (layerCopy) {
            layerCopy.move(100, 100)
            layerCopy.setActive(true)
            renderManager?.addLayer(layerCopy)
            this.state.setActiveLayer(layerCopy)
            renderManager?.reDrawOnNextFrame()
          }
        }
      }
    }
  }
}
