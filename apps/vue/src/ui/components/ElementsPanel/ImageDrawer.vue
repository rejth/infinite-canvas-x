<script setup lang="ts">
import { createCursorFromImage, getImageBitmap } from '@infinite-canvas-x/canvas-engine'
import { Camera } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

import { Tools } from '@/shared/interfaces'
import Button from '@/ui/primitives/button/Button.vue'
import Sheet from '@/ui/primitives/sheet/Sheet.vue'
import SheetContent from '@/ui/primitives/sheet/SheetContent.vue'
import SheetHeader from '@/ui/primitives/sheet/SheetHeader.vue'
import SheetTitle from '@/ui/primitives/sheet/SheetTitle.vue'

import { useImageEditor, useToolbar } from '@/store'

interface Photo {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  alt_description: string
  width: number
  height: number
  user: { name: string }
}

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()

const photos = ref<Photo[]>([])
const toolbar = useToolbar()
const imageEditor = useImageEditor()

onMounted(() => {
  fetch('/api/photos')
    .then((response) => (response.ok ? response.json() : []))
    .then((data: Photo[]) => {
      photos.value = data
    })
    .catch(() => {
      photos.value = []
    })
})

async function handleAddImage(photo: Photo) {
  try {
    const [bitmap, url] = await Promise.all([
      getImageBitmap(photo.urls.regular),
      createCursorFromImage(photo.urls.thumb),
    ])
    imageEditor.value.setImage(bitmap)
    toolbar.value.setTool(Tools.IMAGE)
    toolbar.value.setCursor(`url(${url}) 16 16, crosshair`)
    emit('update:open', false)
  } catch {
    toolbar.value.setCursor('crosshair')
  }
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent
      side="left"
      class="w-[280px] bg-white text-gray-900 border-gray-200 p-0 left-14"
      :style="{ left: '56px' }"
    >
      <SheetHeader class="p-2 pb-1">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <div class="w-5 h-5 bg-gray-900 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-xs italic">K</span>
            </div>
            <SheetTitle class="text-gray-900 text-base">Images</SheetTitle>
          </div>
        </div>
      </SheetHeader>

      <div class="px-2 space-y-2">
        <div class="flex gap-1">
          <Button
            variant="secondary"
            class="flex-1 justify-start gap-1 text-xs h-7 bg-gray-200 text-gray-900"
          >
            <Camera class="w-3 h-3" />
            Upload
          </Button>
        </div>
      </div>

      <div v-if="photos.length > 0" class="px-2 pb-2 flex-1 overflow-y-auto">
        <div class="grid grid-cols-2 gap-1 mt-2">
          <div
            v-for="photo in photos"
            :key="photo.id"
            tabindex="0"
            role="button"
            class="relative group cursor-pointer overflow-hidden bg-gray-100 aspect-square"
            @click="handleAddImage(photo)"
          >
            <img
              :src="photo.urls.small"
              :alt="photo.alt_description"
              class="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <div
              class="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Button
                size="sm"
                class="bg-white/90 text-gray-900 hover:bg-white border border-gray-200 h-5 text-[10px] px-1.5"
              >
                Add to canvas
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="px-2 pb-4 text-xs text-muted-foreground">
        No images loaded. Run <code class="text-xs">vercel dev</code> for the Unsplash API, or upload
        (coming soon).
      </div>
    </SheetContent>
  </Sheet>
</template>
