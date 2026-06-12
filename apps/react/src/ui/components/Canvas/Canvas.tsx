import { memo, useCallback, useEffect, useRef } from 'react'

import { DEFAULT_CURSOR } from '@/shared/constants'
import { useDidMountEffect } from '@/shared/hooks/useDidMountEffect'

import styles from './Canvas.module.css'
import { useCanvasApp } from '@/adapters/react/useCanvasApp'
import { useToolbar } from '@/store'

interface CanvasProps {
  setCanvasRef: (canvas: HTMLCanvasElement) => void
  setBackgroundCanvasRef: (backgroundCanvas: HTMLCanvasElement) => void
}

export const Canvas = memo(function Canvas({ setCanvasRef, setBackgroundCanvasRef }: CanvasProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  const app = useCanvasApp()
  const { cursor } = useToolbar()

  const handleZoomStopped = useCallback(() => {
    app?.getRenderManager()?.reDrawOnNextFrame({ forceRender: true })
  }, [app])

  useEffect(() => {
    if (!app) return
    return app.events.onZoomingStopped(handleZoomStopped)
  }, [app, handleZoomStopped])

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
        style={{ cursor: app ? cursor : DEFAULT_CURSOR }}
        className={styles.mainCanvas}
        ref={setCanvasRef}
        onMouseMove={(e) => app?.handlePointerMove(e.nativeEvent)}
        onMouseDown={(e) => app?.handlePointerDown(e.nativeEvent)}
        onMouseUp={() => app?.handlePointerUp()}
        onDoubleClick={(e) => app?.handleDoubleClick(e.nativeEvent)}
        onTouchMove={() => null}
        onWheel={(e) => app?.handleWheel(e.nativeEvent)}
      />
      <canvas
        id="background-canvas"
        className={styles.backgroundCanvas}
        ref={setBackgroundCanvasRef}
      />
    </div>
  )
})
