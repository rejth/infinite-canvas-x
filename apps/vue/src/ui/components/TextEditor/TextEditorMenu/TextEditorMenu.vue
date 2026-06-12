<script setup lang="ts">
import {
  DEFAULT_SCALE,
  FontStyle,
  type Point,
  TextAlign,
  TextDecoration,
} from '@infinite-canvas-x/canvas-engine'
import {
  AArrowDown,
  AArrowUp,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Spline,
  Underline,
} from 'lucide-vue-next'
import { computed, ref, useCssModule } from 'vue'

import { Colors } from '@/shared/constants'
import Button from '@/ui/primitives/button/Button.vue'
import DropdownMenu from '@/ui/primitives/dropdown-menu/DropdownMenu.vue'
import DropdownMenuContent from '@/ui/primitives/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuTrigger from '@/ui/primitives/dropdown-menu/DropdownMenuTrigger.vue'
import Menubar from '@/ui/primitives/menubar/Menubar.vue'
import Separator from '@/ui/primitives/separator/Separator.vue'
import ToggleGroup from '@/ui/primitives/toggle-group/ToggleGroup.vue'
import ToggleGroupItem from '@/ui/primitives/toggle-group/ToggleGroupItem.vue'

import ColorTile from '../ColorTile/ColorTile.vue'

import { useCanvasApp } from '@/adapters/vue/useCanvasApp'
import { useActiveLayer, useCanvas, useLayerUi, useTextEditor } from '@/store'

const styles = useCssModule()

const props = defineProps<{
  textareaRef: HTMLTextAreaElement | null
  position: Point
}>()

const emit = defineEmits<{
  fontSizeChange: [fontSize: number]
}>()

const appRef = useCanvasApp()
const canvas = useCanvas()
const activeLayerCtx = useActiveLayer()
const layerUi = useLayerUi()
const textEditorCtx = useTextEditor()

const activeLayer = computed(() => activeLayerCtx.value.activeLayer)
const renderer = computed(() => canvas.value.renderer)

const textAlign = computed(() => textEditorCtx.value.textAlign)
const fontSize = computed(() => textEditorCtx.value.fontSize)
const bold = computed(() => textEditorCtx.value.bold)
const italic = computed(() => textEditorCtx.value.italic)
const underline = computed(() => textEditorCtx.value.underline)
const backgroundColor = computed(() => layerUi.value.backgroundColor)
const isTextArea = computed(() => layerUi.value.isTextArea)

function handleBackgroundColorChange(color: Colors) {
  appRef.value?.setActiveLayerBackgroundColor(color)
}

function enableTextTransformation() {
  appRef.value?.transformActiveTextToSpline()
}

function handleFontSizeChange(value: number) {
  const newFontSize = fontSize.value + value
  textEditorCtx.value.setFontSize(newFontSize)
  emit('fontSizeChange', newFontSize)
  props.textareaRef?.focus()
}

function handleFontStyleChange(field: FontStyle | TextDecoration) {
  const ctx = textEditorCtx.value
  if (field === FontStyle.BOLD) ctx.setBold(!bold.value)
  else if (field === FontStyle.ITALIC) ctx.setItalic(!italic.value)
  else if (field === TextDecoration.UNDERLINE) ctx.setUnderline(!underline.value)
  props.textareaRef?.focus()
}

function handleTextAlignChange() {
  let newAlign: TextAlign
  switch (textAlign.value) {
    case TextAlign.LEFT:
      newAlign = TextAlign.CENTER
      break
    case TextAlign.CENTER:
      newAlign = TextAlign.RIGHT
      break
    default:
      newAlign = TextAlign.LEFT
  }
  textEditorCtx.value.setTextAlign(newAlign)
  props.textareaRef?.focus()
}

const fontStyle = computed(() =>
  [
    bold.value ? FontStyle.BOLD : '',
    italic.value ? FontStyle.ITALIC : '',
    underline.value ? TextDecoration.UNDERLINE : '',
  ].filter(Boolean),
)

const alignIcon = computed(() => {
  const icons = {
    [TextAlign.LEFT]: AlignLeft,
    [TextAlign.CENTER]: AlignCenter,
    [TextAlign.RIGHT]: AlignRight,
  }
  return icons[textAlign.value]
})

const menuStyle = computed(() => {
  const layer = activeLayer.value
  const rend = renderer.value
  if (!layer || !rend) return {}

  const [width] = layer.getWidthHeight()
  const { scale } = layer.getOptions()
  const transform = rend.getTransformMatrix()
  const inverseScale = DEFAULT_SCALE / (transform.scaleX / transform.initialScale)
  const menuScale =
    scale === DEFAULT_SCALE ? scale / inverseScale : transform.scaleX / transform.initialScale

  return {
    top: `${props.position.y - 15 * menuScale}px`,
    left: `${props.position.x + (width * menuScale) / 2}px`,
  }
})

const visible = computed(() => layerUi.value.hasActiveLayer && Boolean(renderer.value))
const colorMenuOpen = ref(false)
</script>

<template>
  <div v-if="visible" id="text-editor-menu" :class="styles.menu" :style="menuStyle">
    <Menubar>
      <template v-if="layerUi.showStickerColorPicker">
        <DropdownMenu v-model:open="colorMenuOpen">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="cursor-pointer" type="button">
              <span class="h-6 w-6" :style="{ backgroundColor }" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56">
            <ColorTile @change="handleBackgroundColorChange" />
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation="vertical" />
      </template>

      <ToggleGroup type="multiple" size="sm" :model-value="fontStyle">
        <ToggleGroupItem
          :value="FontStyle.BOLD"
          aria-label="Toggle bold"
          class="cursor-pointer"
          @click="handleFontStyleChange(FontStyle.BOLD)"
        >
          <Bold class="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          :value="FontStyle.ITALIC"
          aria-label="Toggle italic"
          class="cursor-pointer"
          @click="handleFontStyleChange(FontStyle.ITALIC)"
        >
          <Italic class="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          :value="TextDecoration.UNDERLINE"
          aria-label="Toggle underline"
          class="cursor-pointer"
          @click="handleFontStyleChange(TextDecoration.UNDERLINE)"
        >
          <Underline class="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Separator orientation="vertical" />

      <ToggleGroup type="single" :model-value="textAlign">
        <ToggleGroupItem
          :value="textAlign"
          aria-label="Toggle alignment"
          class="cursor-pointer"
          @click="handleTextAlignChange"
        >
          <component :is="alignIcon" class="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Separator orientation="vertical" />

      <ToggleGroup type="multiple" size="sm">
        <ToggleGroupItem
          value="decrease"
          aria-label="Decrease font size"
          class="cursor-pointer"
          @click="handleFontSizeChange(-2)"
        >
          <AArrowDown class="h-6 w-6" :stroke-width="1.25" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="increase"
          aria-label="Increase font size"
          class="cursor-pointer"
          @click="handleFontSizeChange(2)"
        >
          <AArrowUp class="h-6 w-6" :stroke-width="1.25" />
        </ToggleGroupItem>
      </ToggleGroup>

      <template v-if="isTextArea">
        <Separator orientation="vertical" />
        <ToggleGroup type="single">
          <ToggleGroupItem
            value="text-transformation"
            aria-label="Transform text"
            class="cursor-pointer"
            @click="enableTextTransformation"
          >
            <Spline class="h-6 w-6" :stroke-width="1.25" />
          </ToggleGroupItem>
        </ToggleGroup>
      </template>
    </Menubar>
  </div>
</template>

<style module>
.menu {
  display: flex;
  align-items: center;
  position: absolute;
  z-index: 50;
  transform: translate(-52%, -100%);
  pointer-events: auto;
}
</style>
