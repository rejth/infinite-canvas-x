import { useState } from 'react'
import { DEFAULT_RESIZE_DIRECTION, DEFAULT_ZOOM_PERCENTAGE } from '@infinite-canvas-x/canvas-engine'

import { ToolbarContext } from './ToolbarContext'

import { DEFAULT_CURSOR, DEFAULT_TOOL } from '@/app/shared/constants'
import { Tool } from '@/app/shared/interfaces'

type Props = {
  children: React.ReactNode
}

export const ToolbarProvider = ({ children }: Props) => {
  const [tool, setTool] = useState<Tool>(DEFAULT_TOOL)
  const [cursor, setCursor] = useState(DEFAULT_CURSOR)
  const [resizeDirection, setResizeDirection] = useState(DEFAULT_RESIZE_DIRECTION)
  const [zoomPercentage, setZoomPercentage] = useState(DEFAULT_ZOOM_PERCENTAGE)

  return (
    <ToolbarContext.Provider
      value={{
        cursor,
        tool,
        resizeDirection,
        zoomPercentage,
        setCursor,
        setTool,
        setResizeDirection,
        setZoomPercentage,
      }}
    >
      {children}
    </ToolbarContext.Provider>
  )
}
