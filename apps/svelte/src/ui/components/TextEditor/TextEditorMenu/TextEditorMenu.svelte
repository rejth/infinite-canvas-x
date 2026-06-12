<script lang="ts">
import {
  DEFAULT_SCALE,
  FontStyle,
  type Point,
  TextAlign,
  TextDecoration,
} from '@infinite-canvas-x/canvas-engine'
import { DropdownMenu } from 'bits-ui'
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
} from 'lucide-svelte'

import { Colors } from '@/shared/constants'
import Button from '@/ui/primitives/button/Button.svelte'
import DropdownMenuRoot from '@/ui/primitives/dropdown-menu/DropdownMenu.svelte'
import DropdownMenuContent from '@/ui/primitives/dropdown-menu/DropdownMenuContent.svelte'
import Menubar from '@/ui/primitives/menubar/Menubar.svelte'
import Separator from '@/ui/primitives/separator/Separator.svelte'
import ToggleGroup from '@/ui/primitives/toggle-group/ToggleGroup.svelte'
import ToggleGroupItem from '@/ui/primitives/toggle-group/ToggleGroupItem.svelte'

import ColorTile from '../ColorTile/ColorTile.svelte'

import { useCanvasApp } from '@/adapters/svelte/useCanvasApp.svelte'
import { useActiveLayer, useCanvas, useLayerUi, useTextEditor } from '@/store/index.svelte'

type Props = {
  textareaRef: HTMLTextAreaElement | null
  position: Point
  onFontSizeChange: (fontSize: number) => void
}

let { textareaRef, position, onFontSizeChange }: Props = $props()

const getApp = useCanvasApp()
const getCanvas = useCanvas()
const getActiveLayer = useActiveLayer()
const getLayerUi = useLayerUi()
const getTextEditor = useTextEditor()

const activeLayer = $derived(getActiveLayer().activeLayer)
const renderer = $derived(getCanvas().renderer)

const textAlign = $derived(getTextEditor().textAlign)
const fontSize = $derived(getTextEditor().fontSize)
const bold = $derived(getTextEditor().bold)
const italic = $derived(getTextEditor().italic)
const underline = $derived(getTextEditor().underline)
const backgroundColor = $derived(getLayerUi().backgroundColor)
const isTextArea = $derived(getLayerUi().isTextArea)
const layerUi = $derived(getLayerUi())

let colorMenuOpen = $state(false)

function handleBackgroundColorChange(color: Colors) {
  getApp()?.setActiveLayerBackgroundColor(color)
}

function enableTextTransformation() {
  getApp()?.transformActiveTextToSpline()
}

function handleFontSizeChange(value: number) {
  const newFontSize = fontSize + value
  getTextEditor().setFontSize(newFontSize)
  onFontSizeChange(newFontSize)
  textareaRef?.focus()
}

function handleFontStyleChange(field: FontStyle | TextDecoration) {
  const textEditor = getTextEditor()
  if (field === FontStyle.BOLD) textEditor.setBold(!bold)
  else if (field === FontStyle.ITALIC) textEditor.setItalic(!italic)
  else if (field === TextDecoration.UNDERLINE) textEditor.setUnderline(!underline)
  textareaRef?.focus()
}

function handleTextAlignChange() {
  let newAlign: TextAlign
  switch (textAlign) {
    case TextAlign.LEFT:
      newAlign = TextAlign.CENTER
      break
    case TextAlign.CENTER:
      newAlign = TextAlign.RIGHT
      break
    default:
      newAlign = TextAlign.LEFT
  }
  getTextEditor().setTextAlign(newAlign)
  textareaRef?.focus()
}

const fontStyle = $derived(
  [
    bold ? FontStyle.BOLD : '',
    italic ? FontStyle.ITALIC : '',
    underline ? TextDecoration.UNDERLINE : '',
  ].filter(Boolean),
)

const alignIcon = $derived(
  textAlign === TextAlign.LEFT
    ? AlignLeft
    : textAlign === TextAlign.CENTER
      ? AlignCenter
      : AlignRight,
)

const menuStyle = $derived.by(() => {
  const layer = activeLayer
  const rend = renderer
  if (!layer || !rend) return ''

  const [width] = layer.getWidthHeight()
  const { scale } = layer.getOptions()
  const transform = rend.getTransformMatrix()
  const inverseScale = DEFAULT_SCALE / (transform.scaleX / transform.initialScale)
  const menuScale =
    scale === DEFAULT_SCALE ? scale / inverseScale : transform.scaleX / transform.initialScale

  return `top: ${position.y - 15 * menuScale}px; left: ${position.x + (width * menuScale) / 2}px;`
})

const visible = $derived(layerUi.hasActiveLayer && Boolean(renderer))
</script>

{#if visible}
  <div id="text-editor-menu" class="menu" style={menuStyle}>
    <Menubar>
      {#if layerUi.showStickerColorPicker}
        <DropdownMenuRoot bind:open={colorMenuOpen}>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="ghost" class="cursor-pointer" type="button">
                <span class="h-6 w-6" style:background-color={backgroundColor}></span>
              </Button>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenuContent class="w-56">
            <ColorTile onchange={handleBackgroundColorChange} />
          </DropdownMenuContent>
        </DropdownMenuRoot>
        <Separator orientation="vertical" />
      {/if}

      <ToggleGroup type="multiple" size="sm" value={fontStyle}>
        <ToggleGroupItem
          value={FontStyle.BOLD}
          aria-label="Toggle bold"
          class="cursor-pointer"
          onclick={() => handleFontStyleChange(FontStyle.BOLD)}
        >
          <Bold class="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value={FontStyle.ITALIC}
          aria-label="Toggle italic"
          class="cursor-pointer"
          onclick={() => handleFontStyleChange(FontStyle.ITALIC)}
        >
          <Italic class="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value={TextDecoration.UNDERLINE}
          aria-label="Toggle underline"
          class="cursor-pointer"
          onclick={() => handleFontStyleChange(TextDecoration.UNDERLINE)}
        >
          <Underline class="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Separator orientation="vertical" />

      <ToggleGroup type="single" value={textAlign}>
        <ToggleGroupItem
          value={textAlign}
          aria-label="Toggle alignment"
          class="cursor-pointer"
          onclick={handleTextAlignChange}
        >
          {@const AlignIcon = alignIcon}
          <AlignIcon class="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Separator orientation="vertical" />

      <ToggleGroup type="multiple" size="sm" value={[]}>
        <ToggleGroupItem
          value="decrease"
          aria-label="Decrease font size"
          class="cursor-pointer"
          onclick={() => handleFontSizeChange(-2)}
        >
          <AArrowDown class="h-6 w-6" strokeWidth={1.25} />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="increase"
          aria-label="Increase font size"
          class="cursor-pointer"
          onclick={() => handleFontSizeChange(2)}
        >
          <AArrowUp class="h-6 w-6" strokeWidth={1.25} />
        </ToggleGroupItem>
      </ToggleGroup>

      {#if isTextArea}
        <Separator orientation="vertical" />
        <ToggleGroup type="single" value="">
          <ToggleGroupItem
            value="text-transformation"
            aria-label="Transform text"
            class="cursor-pointer"
            onclick={enableTextTransformation}
          >
            <Spline class="h-6 w-6" strokeWidth={1.25} />
          </ToggleGroupItem>
        </ToggleGroup>
      {/if}
    </Menubar>
  </div>
{/if}

<style>
  .menu {
    display: flex;
    align-items: center;
    position: absolute;
    z-index: 50;
    transform: translate(-52%, -100%);
    pointer-events: auto;
  }
</style>
