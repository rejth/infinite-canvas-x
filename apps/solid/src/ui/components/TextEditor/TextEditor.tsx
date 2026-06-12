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
import { createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js'

import { CustomEvents } from '@/shared/interfaces'

import { TextEditorMenu } from './TextEditorMenu/TextEditorMenu.tsx'

import { useActiveLayer, useCanvas, useTextEditor } from '@/store'

export function TextEditor() {
  const getCanvas = useCanvas()
  const activeLayer = useActiveLayer()
  const textEditor = useTextEditor()

  const [textareaRef, setTextareaRef] = createSignal<HTMLTextAreaElement | null>(null)
  const [editorPosition, setEditorPosition] = createSignal(new Point(0, 0))
  const [adaptiveFontSize, setAdaptiveFontSize] = createSignal(16)

  const isLayerEditable = createMemo(() => textEditor().isLayerEditable)

  createEffect(() => {
    setAdaptiveFontSize(textEditor().fontSize)
  })

  function calculateFontSize(currentFontSize: number): number {
    const el = textareaRef()
    const layer = activeLayer().activeLayer
    if (!el || !layer) return currentFontSize

    const { height, scale } = layer.getOptions()
    const currentValue = el.value
    let nextFontSize = currentFontSize

    if (el.scrollHeight * scale > height - SMALL_PADDING) {
      nextFontSize = nextFontSize - 2
    }

    if (currentValue.length < textEditor().text.length && nextFontSize < adaptiveFontSize()) {
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
    setAdaptiveFontSize(calculateFontSize(newFontSize))
  }

  function handleTextChange(event: Event) {
    const layer = activeLayer().activeLayer
    if (!layer) return
    const target = event.target as HTMLTextAreaElement
    textEditor().setFontSize(calculateFontSize(textEditor().fontSize))
    textEditor().setText(target.value)
  }

  const showEditor = createMemo(() => {
    const canvas = getCanvas()
    const layer = activeLayer().activeLayer
    if (!layer || !canvas.renderer) return false
    const rect = layer.getChildByType(CanvasEntityType.RECT)
    return Boolean(rect && isCanvasRect(rect))
  })

  function getTextareaElement() {
    return textareaRef() ?? (document.getElementById('text-editor') as HTMLTextAreaElement | null)
  }

  function focusTextarea() {
    getTextareaElement()?.focus()
  }

  function scheduleFocus() {
    requestAnimationFrame(() => {
      if (getTextareaElement()) {
        focusTextarea()
        return
      }
      requestAnimationFrame(() => focusTextarea())
    })
  }

  function assignTextareaRef(el: HTMLTextAreaElement | undefined) {
    setTextareaRef(el ?? null)
    if (el && isLayerEditable()) {
      scheduleFocus()
    }
  }

  function handleDoubleClick(event: CustomEvent<DoubleClickCustomEvent>) {
    const cam = getCanvas().camera
    const currentActiveLayer = event.detail.layer || activeLayer().activeLayer
    if (!currentActiveLayer || !cam) return

    const clickPosition = cam.handleDoubleClick(event, currentActiveLayer)
    setEditorPosition(clickPosition)

    const textChild = currentActiveLayer.getChildByType(CanvasEntityType.TEXT)
    if (textChild && isCanvasText(textChild)) {
      const textOptions = textChild.getOptions()
      textChild.setOptions({ width: textOptions.width, height: textOptions.height })
      textEditor().setText(textOptions.text)
      textEditor().setTextAlign(textOptions.textAlign)
      textEditor().setFontSize(textOptions.fontSize)
      textEditor().setBold(Boolean(/bold/.test(textOptions.fontStyle)))
      textEditor().setItalic(Boolean(/italic/.test(textOptions.fontStyle)))
      textEditor().setUnderline(Boolean(/underline/.test(textOptions.textDecoration)))
    }

    if (isLayerEditable()) {
      scheduleFocus()
    }
  }

  createEffect(() => {
    if (!showEditor() || !isLayerEditable()) return
    scheduleFocus()
  })

  onMount(() => {
    const onDoubleClick = handleDoubleClick as EventListener
    const onPointerUp = () => {
      if (showEditor() && isLayerEditable()) {
        scheduleFocus()
      }
    }

    window.addEventListener(CustomEvents.DOUBLE_CLICK, onDoubleClick)
    window.addEventListener('mouseup', onPointerUp)

    onCleanup(() => {
      window.removeEventListener(CustomEvents.DOUBLE_CLICK, onDoubleClick)
      window.removeEventListener('mouseup', onPointerUp)
    })
  })

  const editorStyle = createMemo(() => {
    const layer = activeLayer().activeLayer
    const rend = getCanvas().renderer
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
      `visibility: ${isLayerEditable() ? 'visible' : 'hidden'}`,
      `left: ${editorPosition().x + SMALL_PADDING * editorScale}px`,
      `top: ${editorPosition().y + SMALL_PADDING * editorScale}px`,
      `width: ${width - SMALL_PADDING * 2}px`,
      `height: ${height - SMALL_PADDING * 2}px`,
      `transform: scale(${editorScale})`,
      `text-align: ${textEditor().textAlign}`,
      `font-size: ${textEditor().fontSize}px`,
      `font-weight: ${textEditor().bold ? FontStyle.BOLD : Number(DEFAULT_FONT_WEIGHT)}`,
    ]

    if (textEditor().italic) styles.push(`font-style: ${FontStyle.ITALIC}`)
    if (textEditor().underline) styles.push(`text-decoration: ${TextDecoration.UNDERLINE}`)

    return styles.join('; ')
  })

  return (
    <>
      {showEditor() ? (
        <>
          <textarea
            id="text-editor"
            ref={assignTextareaRef}
            value={textEditor().text}
            class="text-editor"
            placeholder="Enter text"
            style={editorStyle()}
            autofocus={isLayerEditable()}
            onInput={handleTextChange}
          />
          {isLayerEditable() ? (
            <TextEditorMenu
              textareaRef={textareaRef()}
              position={editorPosition()}
              onFontSizeChange={handleFontSizeChange}
            />
          ) : null}
        </>
      ) : null}
      <style>{`
        .text-editor {
          box-sizing: border-box;
          background: transparent;
          position: absolute;
          padding: 0;
          z-index: 50;
          line-break: anywhere;
          overflow: hidden;
          resize: none;
          border: none;
          outline: none;
          transform-origin: top left;
          text-align: center;
          pointer-events: auto;
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
      `}</style>
    </>
  )
}
