import {
  DEFAULT_SCALE,
  FontStyle,
  type Point,
  TextAlign,
  TextDecoration,
} from '@infinite-canvas-x/canvas-engine'
import AArrowDown from 'lucide-solid/icons/a-arrow-down'
import AArrowUp from 'lucide-solid/icons/a-arrow-up'
import AlignCenter from 'lucide-solid/icons/align-center'
import AlignLeft from 'lucide-solid/icons/align-left'
import AlignRight from 'lucide-solid/icons/align-right'
import Bold from 'lucide-solid/icons/bold'
import Italic from 'lucide-solid/icons/italic'
import Spline from 'lucide-solid/icons/spline'
import Underline from 'lucide-solid/icons/underline'
import { createEffect, createMemo, createSignal, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { Colors } from '@/shared/constants'
import { Button } from '@/ui/primitives/button/Button'
import { DropdownMenu } from '@/ui/primitives/dropdown-menu/DropdownMenu'
import { DropdownMenuContent } from '@/ui/primitives/dropdown-menu/DropdownMenuContent'
import { DropdownMenuTrigger } from '@/ui/primitives/dropdown-menu/DropdownMenuTrigger'
import { Menubar } from '@/ui/primitives/menubar/Menubar'
import { Separator } from '@/ui/primitives/separator/Separator'
import { ToggleGroup } from '@/ui/primitives/toggle-group/ToggleGroup'
import { ToggleGroupItem } from '@/ui/primitives/toggle-group/ToggleGroupItem'

import { ColorTile } from '../ColorTile/ColorTile.tsx'

import { useCanvasApp } from '@/adapters/solid/useCanvasApp'
import { useActiveLayer, useCanvas, useLayerUi, useTextEditor } from '@/store'

type TextEditorMenuProps = {
  textareaRef: HTMLTextAreaElement | null
  position: Point
  onFontSizeChange: (fontSize: number) => void
}

export function TextEditorMenu(props: TextEditorMenuProps) {
  const getApp = useCanvasApp()
  const getCanvas = useCanvas()
  const activeLayer = useActiveLayer()
  const layerUi = useLayerUi()
  const textEditor = useTextEditor()

  const [colorMenuOpen, setColorMenuOpen] = createSignal(false)

  function handleBackgroundColorChange(color: Colors) {
    getApp()?.setActiveLayerBackgroundColor(color)
  }

  function enableTextTransformation() {
    getApp()?.transformActiveTextToSpline()
  }

  function handleFontSizeChange(value: number) {
    const newFontSize = textEditor().fontSize + value
    textEditor().setFontSize(newFontSize)
    props.onFontSizeChange(newFontSize)
    props.textareaRef?.focus()
  }

  function handleFontStyleChange(field: FontStyle | TextDecoration) {
    if (field === FontStyle.BOLD) textEditor().setBold(!textEditor().bold)
    else if (field === FontStyle.ITALIC) textEditor().setItalic(!textEditor().italic)
    else if (field === TextDecoration.UNDERLINE) textEditor().setUnderline(!textEditor().underline)
    props.textareaRef?.focus()
  }

  function handleTextAlignChange() {
    let newAlign: TextAlign
    switch (textEditor().textAlign) {
      case TextAlign.LEFT:
        newAlign = TextAlign.CENTER
        break
      case TextAlign.CENTER:
        newAlign = TextAlign.RIGHT
        break
      default:
        newAlign = TextAlign.LEFT
    }
    textEditor().setTextAlign(newAlign)
    props.textareaRef?.focus()
  }

  const fontStyle = createMemo(() =>
    [
      textEditor().bold ? FontStyle.BOLD : '',
      textEditor().italic ? FontStyle.ITALIC : '',
      textEditor().underline ? TextDecoration.UNDERLINE : '',
    ].filter(Boolean),
  )

  const AlignIcon = createMemo(() => {
    switch (textEditor().textAlign) {
      case TextAlign.LEFT:
        return AlignLeft
      case TextAlign.CENTER:
        return AlignCenter
      default:
        return AlignRight
    }
  })

  const menuStyle = createMemo(() => {
    const layer = activeLayer().activeLayer
    const rend = getCanvas().renderer
    if (!layer || !rend) return ''

    const [width] = layer.getWidthHeight()
    const { scale } = layer.getOptions()
    const transform = rend.getTransformMatrix()
    const inverseScale = DEFAULT_SCALE / (transform.scaleX / transform.initialScale)
    const menuScale =
      scale === DEFAULT_SCALE ? scale / inverseScale : transform.scaleX / transform.initialScale

    return `top: ${props.position.y - 15 * menuScale}px; left: ${props.position.x + (width * menuScale) / 2}px;`
  })

  const visible = createMemo(() => layerUi().hasActiveLayer && Boolean(getCanvas().renderer))

  function reclaimTextareaFocus() {
    const focus = () => props.textareaRef?.focus()
    focus()
    queueMicrotask(focus)
    requestAnimationFrame(() => {
      focus()
      if (layerUi().showStickerColorPicker) {
        requestAnimationFrame(focus)
        window.setTimeout(focus, 50)
      }
    })
  }

  createEffect(() => {
    if (!visible()) return
    reclaimTextareaFocus()
  })

  return (
    <Show when={visible()}>
      <div id="text-editor-menu" class="menu" style={menuStyle()}>
        <Menubar class="outline-none" tabIndex={-1}>
          <Show when={layerUi().showStickerColorPicker}>
            <DropdownMenu open={colorMenuOpen()} onOpenChange={setColorMenuOpen}>
              <DropdownMenuTrigger as="button">
                <Button variant="ghost" class="cursor-pointer" type="button" tabIndex={-1}>
                  <span class="h-6 w-6" style={`background-color: ${layerUi().backgroundColor}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-56">
                <ColorTile onChange={handleBackgroundColorChange} />
              </DropdownMenuContent>
            </DropdownMenu>
            <Separator orientation="vertical" />
          </Show>

          <ToggleGroup type="multiple" size="sm" value={fontStyle()}>
            <ToggleGroupItem
              value={FontStyle.BOLD}
              aria-label="Toggle bold"
              class="cursor-pointer"
              onClick={() => handleFontStyleChange(FontStyle.BOLD)}
            >
              <Bold class="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value={FontStyle.ITALIC}
              aria-label="Toggle italic"
              class="cursor-pointer"
              onClick={() => handleFontStyleChange(FontStyle.ITALIC)}
            >
              <Italic class="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value={TextDecoration.UNDERLINE}
              aria-label="Toggle underline"
              class="cursor-pointer"
              onClick={() => handleFontStyleChange(TextDecoration.UNDERLINE)}
            >
              <Underline class="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <Separator orientation="vertical" />

          <ToggleGroup type="single" value={textEditor().textAlign}>
            <ToggleGroupItem
              value={textEditor().textAlign}
              aria-label="Toggle alignment"
              class="cursor-pointer"
              onClick={handleTextAlignChange}
            >
              <Dynamic component={AlignIcon()} class="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <Separator orientation="vertical" />

          <ToggleGroup type="multiple" size="sm" value={[]}>
            <ToggleGroupItem
              value="decrease"
              aria-label="Decrease font size"
              class="cursor-pointer"
              onClick={() => handleFontSizeChange(-2)}
            >
              <AArrowDown class="h-6 w-6" stroke-width={1.25} />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="increase"
              aria-label="Increase font size"
              class="cursor-pointer"
              onClick={() => handleFontSizeChange(2)}
            >
              <AArrowUp class="h-6 w-6" stroke-width={1.25} />
            </ToggleGroupItem>
          </ToggleGroup>

          <Show when={layerUi().isTextArea}>
            <Separator orientation="vertical" />
            <ToggleGroup type="single" value="">
              <ToggleGroupItem
                value="text-transformation"
                aria-label="Transform text"
                class="cursor-pointer"
                onClick={enableTextTransformation}
              >
                <Spline class="h-6 w-6" stroke-width={1.25} />
              </ToggleGroupItem>
            </ToggleGroup>
          </Show>
        </Menubar>
      </div>
      <style>{`
        .menu {
          display: flex;
          align-items: center;
          position: absolute;
          z-index: 50;
          transform: translate(-52%, -100%);
          pointer-events: auto;
        }
      `}</style>
    </Show>
  )
}
