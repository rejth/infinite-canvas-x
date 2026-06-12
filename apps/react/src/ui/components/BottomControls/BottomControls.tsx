import { Minus, Plus, Redo2, Undo2 } from 'lucide-react'

import { Button } from '@/ui/primitives/button'

import { useCanvasApp } from '@/adapters/react/useCanvasApp'
import { useToolbar } from '@/store'

export function BottomControls() {
  const app = useCanvasApp()
  const { zoomPercentage } = useToolbar()

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-full px-4 py-2 flex items-center gap-1 shadow-lg border border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {}}
          className="h-8 w-8 p-0 text-black hover:bg-gray-100 rounded-full cursor-pointer"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {}}
          className="h-8 w-8 p-0 text-black hover:bg-gray-100 rounded-full cursor-pointer"
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => app?.zoomOut()}
          className="h-8 w-8 p-0 text-black hover:bg-gray-100 rounded-full cursor-pointer"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="px-3 py-1 text-black text-sm font-medium min-w-[3rem] text-center">
          {zoomPercentage}%
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => app?.zoomIn()}
          className="h-8 w-8 p-0 text-black hover:bg-gray-100 rounded-full cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
