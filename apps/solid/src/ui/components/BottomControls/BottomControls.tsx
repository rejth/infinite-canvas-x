import Minus from 'lucide-solid/icons/minus'
import Plus from 'lucide-solid/icons/plus'
import Redo2 from 'lucide-solid/icons/redo-2'
import Undo2 from 'lucide-solid/icons/undo-2'

import { Button } from '@/ui/primitives/button/Button'

import { useCanvasApp } from '@/adapters/solid/useCanvasApp'
import { useToolbar } from '@/store'

export function BottomControls() {
  const getApp = useCanvasApp()
  const toolbar = useToolbar()

  return (
    <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div class="bg-white rounded-full px-4 py-2 flex items-center gap-1 shadow-lg border border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0 text-black hover:bg-gray-100 rounded-full cursor-pointer"
        >
          <Undo2 class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0 text-black hover:bg-gray-100 rounded-full cursor-pointer"
        >
          <Redo2 class="h-4 w-4" />
        </Button>

        <div class="w-px h-6 bg-gray-300 mx-2" />

        <Button
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0 text-black hover:bg-gray-100 rounded-full cursor-pointer"
          onClick={() => getApp()?.zoomOut()}
        >
          <Minus class="h-4 w-4" />
        </Button>

        <div class="px-3 py-1 text-black text-sm font-medium min-w-[3rem] text-center">
          {toolbar().zoomPercentage}%
        </div>

        <Button
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0 text-black hover:bg-gray-100 rounded-full cursor-pointer"
          onClick={() => getApp()?.zoomIn()}
        >
          <Plus class="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
