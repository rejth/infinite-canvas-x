<script lang="ts">
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
import { onDestroy, onMount, tick } from 'svelte'

import { CustomEvents } from '@/shared/interfaces'

import TextEditorMenu from './TextEditorMenu/TextEditorMenu.svelte'

import { useActiveLayer, useCanvas, useTextEditor } from '@/store/index.svelte'

const getCanvas = useCanvas()
const getActiveLayer = useActiveLayer()
const getTextEditor = useTextEditor()

let textareaRef = $state<HTMLTextAreaElement | null>(null)
let editorPosition = $state(new Point(0, 0))
let adaptiveFontSize = $state(16)

const renderer = $derived(getCanvas().renderer)
const activeLayer = $derived(getActiveLayer().activeLayer)
const isLayerEditable = $derived(getTextEditor().isLayerEditable)
const text = $derived(getTextEditor().text)
const textAlign = $derived(getTextEditor().textAlign)
const fontSize = $derived(getTextEditor().fontSize)
const bold = $derived(getTextEditor().bold)
const italic = $derived(getTextEditor().italic)
const underline = $derived(getTextEditor().underline)

$effect(() => {
  adaptiveFontSize = getTextEditor().fontSize
})

function calculateFontSize(currentFontSize: number): number {
  const el = textareaRef
  const layer = activeLayer
  if (!el || !layer) return currentFontSize

  const { height, scale } = layer.getOptions()
  const currentValue = el.value
  let nextFontSize = currentFontSize

  if (el.scrollHeight * scale > height - SMALL_PADDING) {
    nextFontSize = nextFontSize - 2
  }

  if (currentValue.length < text.length && nextFontSize < adaptiveFontSize) {
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
  adaptiveFontSize = calculateFontSize(newFontSize)
}

function handleTextChange(event: Event) {
  const layer = activeLayer
  if (!layer) return
  const target = event.target as HTMLTextAreaElement
  const textEditor = getTextEditor()
  textEditor.setFontSize(calculateFontSize(fontSize))
  textEditor.setText(target.value)
}

const showEditor = $derived.by(() => {
  if (!activeLayer || !renderer) return false
  const rect = activeLayer.getChildByType(CanvasEntityType.RECT)
  return Boolean(rect && isCanvasRect(rect))
})

async function focusTextarea() {
  await tick()
  textareaRef?.focus()
}

function handleDoubleClick(event: CustomEvent<DoubleClickCustomEvent>) {
  const cam = getCanvas().camera
  const currentActiveLayer = event.detail.layer || activeLayer
  if (!currentActiveLayer || !cam) return

  const clickPosition = cam.handleDoubleClick(event, currentActiveLayer)
  editorPosition = clickPosition

  const textChild = currentActiveLayer.getChildByType(CanvasEntityType.TEXT)
  if (textChild && isCanvasText(textChild)) {
    const textOptions = textChild.getOptions()
    textChild.setOptions({ width: textOptions.width, height: textOptions.height })
    const textEditor = getTextEditor()
    textEditor.setText(textOptions.text)
    textEditor.setTextAlign(textOptions.textAlign)
    textEditor.setFontSize(textOptions.fontSize)
    textEditor.setBold(Boolean(/bold/.test(textOptions.fontStyle)))
    textEditor.setItalic(Boolean(/italic/.test(textOptions.fontStyle)))
    textEditor.setUnderline(Boolean(/underline/.test(textOptions.textDecoration)))
  }

  if (isLayerEditable) {
    void focusTextarea()
  }
}

$effect(() => {
  if (showEditor && isLayerEditable) {
    void focusTextarea()
  }
})

onMount(() => {
  window.addEventListener(CustomEvents.DOUBLE_CLICK, handleDoubleClick as EventListener)
})

onDestroy(() => {
  window.removeEventListener(CustomEvents.DOUBLE_CLICK, handleDoubleClick as EventListener)
})

const editorStyle = $derived.by(() => {
  const layer = activeLayer
  const rend = renderer
  if (!layer || !rend) return ''

  const rect = layer.getChildByType(CanvasEntityType.RECT)
  if (!rect || !isCanvasRect(rect)) return ''

  const { scale } = rect.getOptions()
  const transform = rend.getTransformMatrix()
  const inverseScale = DEFAULT_SCALE / (transform.scaleX / transform.initialScale)
  const editorScale = scale / inverseScale
  const isTextArea = rect.getSubtype() === CanvasEntitySubtype.TEXT
  const width = isTextArea ? DEFAULT_TEXT_AREA_WIDTH : DEFAULT_RECT_SIZE
  const height = isTextArea ? DEFAULT_TEXT_AREA_HEIGHT : DEFAULT_RECT_SIZE

  const styles: string[] = [
    `visibility: ${isLayerEditable ? 'visible' : 'hidden'}`,
    `left: ${editorPosition.x + SMALL_PADDING * editorScale}px`,
    `top: ${editorPosition.y + SMALL_PADDING * editorScale}px`,
    `width: ${width - SMALL_PADDING * 2}px`,
    `height: ${height - SMALL_PADDING * 2}px`,
    `transform: scale(${editorScale})`,
    `text-align: ${textAlign}`,
    `font-size: ${fontSize}px`,
    `font-weight: ${bold ? FontStyle.BOLD : Number(DEFAULT_FONT_WEIGHT)}`,
  ]

  if (italic) styles.push(`font-style: ${FontStyle.ITALIC}`)
  if (underline) styles.push(`text-decoration: ${TextDecoration.UNDERLINE}`)

  return styles.join('; ')
})
</script>

{#if showEditor}
  {#if isLayerEditable}
    <TextEditorMenu
      {textareaRef}
      position={editorPosition}
      onFontSizeChange={handleFontSizeChange}
    />
  {/if}
  <textarea
    id="text-editor"
    bind:this={textareaRef}
    value={text}
    class="text-editor"
    placeholder="Enter text"
    style={editorStyle}
    oninput={handleTextChange}
  ></textarea>
{/if}

<style>
  .text-editor {
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

  .text-editor::placeholder {
    color: var(--muted-foreground);
  }

  .text-editor:focus-visible {
    outline: none;
  }

  .text-editor:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
</style>
