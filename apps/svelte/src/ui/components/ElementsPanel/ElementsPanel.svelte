<script lang="ts">
import { ImageIcon } from 'lucide-svelte'

import Button from '@/ui/primitives/button/Button.svelte'

import ImageDrawer from './ImageDrawer.svelte'

import { useCanvasApp } from '@/adapters/svelte/useCanvasApp.svelte'

const getApp = useCanvasApp()
let isImagesOpen = $state(false)

function handleOpenDrawer() {
  isImagesOpen = true
  getApp()?.deselectActiveLayer()
}
</script>

<div
  class="fixed left-0 top-0 h-full w-14 bg-white border-r border-gray-200 flex flex-col items-center py-3 z-40"
>
  <div class="mb-4">
    <div class="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
      <span class="text-white font-bold text-base italic">K</span>
    </div>
  </div>

  <div class="flex flex-col gap-1">
    <Button
      variant="ghost"
      size="sm"
      class="w-8 h-8 p-0 text-gray-700 hover:text-black hover:bg-gray-100"
      onclick={handleOpenDrawer}
    >
      <ImageIcon class="w-4 h-4" />
      <span class="sr-only">Images</span>
    </Button>
  </div>
</div>

<ImageDrawer bind:open={isImagesOpen} />
