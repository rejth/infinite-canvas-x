<script setup lang="ts">
import { ImageIcon } from 'lucide-vue-next'
import { ref } from 'vue'

import Button from '@/ui/primitives/button/Button.vue'

import ImageDrawer from './ImageDrawer.vue'

import { useCanvasApp } from '@/adapters/vue/useCanvasApp'

const appRef = useCanvasApp()
const isImagesOpen = ref(false)

function handleOpenDrawer(open: boolean) {
  isImagesOpen.value = open
  appRef.value?.deselectActiveLayer()
}
</script>

<template>
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
        @click="handleOpenDrawer(true)"
      >
        <ImageIcon class="w-4 h-4" />
        <span class="sr-only">Images</span>
      </Button>
    </div>
  </div>

  <ImageDrawer :open="isImagesOpen" @update:open="handleOpenDrawer" />
</template>
