import { useCallback, useEffect, useRef } from 'react'

import { useDidMountEffect } from '@/shared/hooks/useDidMountEffect'
import { CustomEvents } from '@/shared/interfaces'

import styles from './Canvas.module.css'
import { useCacheControlPoints } from '@/hooks/useCacheControlPoints'
import { useCanvasOnClick } from '@/hooks/useCanvasOnClick'
import { useCanvasOnDoubleClick } from '@/hooks/useCanvasOnDoubleClick'
import { useCanvasOnMove } from '@/hooks/useCanvasOnMove'
import { useCanvasOnWheel } from '@/hooks/useCanvasOnWheel'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useRestoreCanvasState } from '@/hooks/useRestoreCanvasState'
import { useSyncAddedLayer } from '@/hooks/useSyncAddedLayer'
import { useCanvasContext, useToolbarContext } from '@/store'

interface CanvasProps {
  setCanvasRef: (canvas: HTMLCanvasElement) => void
  setBackgroundCanvasRef: (backgroundCanvas: HTMLCanvasElement) => void
}

export const Canvas = ({ setCanvasRef, setBackgroundCanvasRef }: CanvasProps) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  const { renderManager, camera } = useCanvasContext()
  const { cursor } = useToolbarContext()

  const handleClick = useCanvasOnClick()
  const handleWheel = useCanvasOnWheel()
  const handleMove = useCanvasOnMove()
  const handleDoubleClick = useCanvasOnDoubleClick()
  const { cacheControlPoint, stopCacheControlPoint } = useCacheControlPoints()
  const restoreCanvasState = useRestoreCanvasState()
  const syncLayerChanges = useSyncAddedLayer()

  useKeyboard()

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    camera?.handleMouseDown(e.nativeEvent)
    cacheControlPoint(e)
    handleClick(e)
  }

  const handleMouseUp = async () => {
    camera?.handleMouseUp()
    stopCacheControlPoint()
    syncLayerChanges()
  }

  const handleZoomStopped = useCallback(() => {
    renderManager?.reDrawOnNextFrame({ forceRender: true })
  }, [renderManager])

  const handleTouchMove = () => null

  useEffect(() => {
    restoreCanvasState()
  }, [restoreCanvasState])

  useEffect(() => {
    document.addEventListener(CustomEvents.ZOOMING_STOPPED, handleZoomStopped)
    return () => document.removeEventListener(CustomEvents.ZOOMING_STOPPED, handleZoomStopped)
  }, [handleZoomStopped])

  useDidMountEffect(() => {
    const container = canvasContainerRef.current

    if (container) {
      const handleWheelPreventDefault = (e: WheelEvent) => e.preventDefault()
      container.addEventListener('wheel', handleWheelPreventDefault, { passive: false })
      return () => {
        container.removeEventListener('wheel', handleWheelPreventDefault)
      }
    }
  })

  return (
    <div ref={canvasContainerRef}>
      <canvas
        id="main-canvas"
        style={{ cursor }}
        className={styles.mainCanvas}
        ref={setCanvasRef}
        onMouseMove={handleMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchMove={handleTouchMove}
        onWheel={handleWheel}
      />
      <canvas
        id="background-canvas"
        className={styles.backgroundCanvas}
        ref={setBackgroundCanvasRef}
      />
    </div>
  )
}
