<script lang="ts">
import { Minus, Plus, Redo2, Undo2 } from 'lucide-svelte'

import Button from '@/ui/primitives/button/Button.svelte'

import { useCanvasApp } from '@/adapters/svelte/useCanvasApp.svelte'
import { useToolbar } from '@/store/index.svelte'

const getApp = useCanvasApp()
const getToolbar = useToolbar()
const zoomPercentage = $derived(getToolbar().zoomPercentage)
</script>

<div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
  <div
    class="bg-white rounded-full px-4 py-2 flex items-center gap-1 shadow-lg border border-gray-200"
  >
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

    <div class="w-px h-6 bg-gray-300 mx-2"></div>

    <Button
      variant="ghost"
      size="sm"
      class="h-8 w-8 p-0 text-black hover:bg-gray-100 rounded-full cursor-pointer"
      onclick={() => getApp()?.zoomOut()}
    >
      <Minus class="h-4 w-4" />
    </Button>

    <div class="px-3 py-1 text-black text-sm font-medium min-w-[3rem] text-center">
      {zoomPercentage}%
    </div>

    <Button
      variant="ghost"
      size="sm"
      class="h-8 w-8 p-0 text-black hover:bg-gray-100 rounded-full cursor-pointer"
      onclick={() => getApp()?.zoomIn()}
    >
      <Plus class="h-4 w-4" />
    </Button>
  </div>
</div>
