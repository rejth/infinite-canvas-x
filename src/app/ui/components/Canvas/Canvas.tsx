import { useCallback, useEffect, useRef } from 'react'

import styles from './Canvas.module.css'
import { useCacheControlPoints } from '@/app/hooks/useCacheControlPoints'
import { useCanvasOnClick } from '@/app/hooks/useCanvasOnClick'
import { useCanvasOnDoubleClick } from '@/app/hooks/useCanvasOnDoubleClick'
import { useCanvasOnMove } from '@/app/hooks/useCanvasOnMove'
import { useCanvasOnWheel } from '@/app/hooks/useCanvasOnWheel'
import { useKeyboard } from '@/app/hooks/useKeyboard'
import { useRestoreCanvasState } from '@/app/hooks/useRestoreCanvasState'
import { useSyncAddedLayer } from '@/app/hooks/useSyncAddedLayer'
import { useDidMountEffect } from '@/app/shared/hooks/useDidMountEffect'
import { CustomEvents } from '@/app/shared/interfaces'
import { useCanvasContext, useToolbarContext } from '@/app/store'

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
