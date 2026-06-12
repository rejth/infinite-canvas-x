<script setup lang="ts">
import {
  CanvasEntitySubtype,
  CanvasEntityType,
  DEFAULT_FONT_WEIGHT,
  DEFAULT_RECT_SIZE,
  DEFAULT_SCALE,
  DEFAULT_TEXT_AREA_HEIGHT,
  DEFAULT_TEXT_AREA_WIDTH,
  type DoubleClickCustomEvent,
  FontStyle,
  isCanvasRect,
  isCanvasText,
  Point,
  SMALL_PADDING,
  TextDecoration,
} from '@infinite-canvas-x/canvas-engine'
import {
  type CSSProperties,
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  useCssModule,
  watch,
} from 'vue'

import { CustomEvents } from '@/shared/interfaces'

import TextEditorMenu from './TextEditorMenu/TextEditorMenu.vue'

import { useActiveLayer, useCanvas, useTextEditor } from '@/store'

const styles = useCssModule()

const canvas = useCanvas()
const activeLayerCtx = useActiveLayer()
const textEditorCtx = useTextEditor()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const editorPosition = ref(new Point(0, 0))
const adaptiveFontSize = ref(textEditorCtx.value.fontSize)

const renderer = computed(() => canvas.value.renderer)
const activeLayer = computed(() => activeLayerCtx.value.activeLayer)
const isLayerEditable = computed(() => textEditorCtx.value.isLayerEditable)
const text = computed(() => textEditorCtx.value.text)
const textAlign = computed(() => textEditorCtx.value.textAlign)
const fontSize = computed(() => textEditorCtx.value.fontSize)
const bold = computed(() => textEditorCtx.value.bold)
const italic = computed(() => textEditorCtx.value.italic)
const underline = computed(() => textEditorCtx.value.underline)

function calculateFontSize(currentFontSize: number): number {
  const el = textareaRef.value
  const layer = activeLayer.value
  if (!el || !layer) return currentFontSize

  const { height, scale } = layer.getOptions()
  const currentValue = el.value
  let nextFontSize = currentFontSize

  if (el.scrollHeight * scale > height - SMALL_PADDING) {
    nextFontSize = nextFontSize - 2
  }

  if (currentValue.length < text.value.length && nextFontSize < adaptiveFontSize.value) {
    el.style.fontSize = `${nextFontSize + 2}px`

    if (el.scrollHeight * scale <= height - SMALL_PADDING) {
      nextFontSize = nextFontSize + 2
    } else {
      el.style.fontSize = `${nextFontSize}px`
    }
  }

  return nextFontSize
}

function handleFontSizeChange(newFontSize: number) {
  adaptiveFontSize.value = calculateFontSize(newFontSize)
}

function handleTextChange(e: Event) {
  const layer = activeLayer.value
  if (!layer) return
  const target = e.target as HTMLTextAreaElement
  const ctx = textEditorCtx.value
  ctx.setFontSize(calculateFontSize(fontSize.value))
  ctx.setText(target.value)
}

const showEditor = computed(() => {
  if (!activeLayer.value || !renderer.value) return false
  const rect = activeLayer.value.getChildByType(CanvasEntityType.RECT)
  return Boolean(rect && isCanvasRect(rect))
})

async function focusTextarea() {
  await nextTick()
  textareaRef.value?.focus()
}

function handleDoubleClick(e: CustomEvent<DoubleClickCustomEvent>) {
  const cam = canvas.value.camera
  const currentActiveLayer = e.detail.layer || activeLayer.value
  if (!currentActiveLayer || !cam) return

  const clickPosition = cam.handleDoubleClick(e, currentActiveLayer)
  editorPosition.value = clickPosition

  const textChild = currentActiveLayer.getChildByType(CanvasEntityType.TEXT)
  if (textChild && isCanvasText(textChild)) {
    const textOptions = textChild.getOptions()
    textChild.setOptions({ width: textOptions.width, height: textOptions.height })
    const ctx = textEditorCtx.value
    ctx.setText(textOptions.text)
    ctx.setTextAlign(textOptions.textAlign)
    ctx.setFontSize(textOptions.fontSize)
    ctx.setBold(Boolean(/bold/.test(textOptions.fontStyle)))
    ctx.setItalic(Boolean(/italic/.test(textOptions.fontStyle)))
    ctx.setUnderline(Boolean(/underline/.test(textOptions.textDecoration)))
  }

  if (isLayerEditable.value) {
    focusTextarea()
  }
}

watch([showEditor, isLayerEditable], ([show, editable]) => {
  if (show && editable) {
    focusTextarea()
  }
})

onMounted(() => {
  window.addEventListener(CustomEvents.DOUBLE_CLICK, handleDoubleClick as EventListener)
})

onUnmounted(() => {
  window.removeEventListener(CustomEvents.DOUBLE_CLICK, handleDoubleClick as EventListener)
})

const editorStyle = computed((): CSSProperties => {
  const layer = activeLayer.value
  const rend = renderer.value
  if (!layer || !rend) return {}

  const rect = layer.getChildByType(CanvasEntityType.RECT)
  if (!rect || !isCanvasRect(rect)) return {}

  const { scale } = rect.getOptions()
  const transform = rend.getTransformMatrix()
  const inverseScale = DEFAULT_SCALE / (transform.scaleX / transform.initialScale)
  const editorScale = scale / inverseScale
  const isTextArea = rect.getSubtype() === CanvasEntitySubtype.TEXT
  const width = isTextArea ? DEFAULT_TEXT_AREA_WIDTH : DEFAULT_RECT_SIZE
  const height = isTextArea ? DEFAULT_TEXT_AREA_HEIGHT : DEFAULT_RECT_SIZE

  return {
    visibility: isLayerEditable.value ? 'visible' : 'hidden',
    left: `${editorPosition.value.x + SMALL_PADDING * editorScale}px`,
    top: `${editorPosition.value.y + SMALL_PADDING * editorScale}px`,
    width: `${width - SMALL_PADDING * 2}px`,
    height: `${height - SMALL_PADDING * 2}px`,
    transform: `scale(${editorScale})`,
    textAlign: textAlign.value as CSSProperties['textAlign'],
    fontSize: `${fontSize.value}px`,
    fontStyle: italic.value ? FontStyle.ITALIC : undefined,
    fontWeight: bold.value ? FontStyle.BOLD : Number(DEFAULT_FONT_WEIGHT),
    textDecoration: underline.value ? TextDecoration.UNDERLINE : undefined,
  }
})
</script>

<template>
  <template v-if="showEditor">
    <TextEditorMenu
      v-if="isLayerEditable"
      :textarea-ref="textareaRef"
      :position="editorPosition"
      @font-size-change="handleFontSizeChange"
    />
    <textarea
      id="text-editor"
      ref="textareaRef"
      :value="text"
      :class="styles.textEditor"
      placeholder="Enter text"
      :style="editorStyle"
      @input="handleTextChange"
    />
  </template>
</template>

<style module>
.textEditor {
  box-sizing: border-box;
  background: transparent;
  position: absolute;
  padding: 0;
  z-index: 10;
  line-break: anywhere;
  overflow: hidden;
  resize: none;
  border: none;
  outline: none;
  transform-origin: top left;
  text-align: center;
}

.textEditor::placeholder {
  color: var(--muted-foreground);
}

.textEditor:focus-visible {
  outline: none;
}

.textEditor:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
