import {
  DEFAULT_SCALE,
  FontStyle,
  Point,
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
} from 'lucide-react'

import { Colors } from '@/shared/constants'
import { Button } from '@/ui/primitives/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/ui/primitives/dropdown-menu'
import { Menubar } from '@/ui/primitives/menubar'
import { Separator } from '@/ui/primitives/separator'
import { ToggleGroup, ToggleGroupItem } from '@/ui/primitives/toggle-group'

import { ColorTile } from '../ColorTile/ColorTile'

import styles from './TextEditorMenu.module.css'
import { useCanvasApp } from '@/adapters/react/useCanvasApp'
import { useActiveLayer, useCanvas, useLayerUi, useTextEditor } from '@/store'

interface TextEditorMenuProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  position: Point
  onFontSizeChange: (fontSize: number) => void
}

export const TextEditorMenu = ({
  textareaRef,
  position,
  onFontSizeChange,
}: TextEditorMenuProps) => {
  const app = useCanvasApp()
  const { renderer } = useCanvas()
  const { activeLayer } = useActiveLayer()
  const layerUi = useLayerUi()
  const { textAlign, fontSize, bold, italic, underline, ...actions } = useTextEditor()
  const { setTextAlign, setFontSize, setBold, setItalic, setUnderline } = actions

  if (!layerUi.hasActiveLayer || !renderer) return null

  const handleBackgroundColorChange = (color: Colors) => {
    app?.setActiveLayerBackgroundColor(color)
  }

  const enableTextTransformation = () => {
    app?.transformActiveTextToSpline()
  }

  const handleFontSizeChange = (value: number) => {
    const newFontSize = fontSize + value
    setFontSize(newFontSize)
    onFontSizeChange(newFontSize)
    textareaRef?.current?.focus()
  }

  const handleFontStyleChange = (field: FontStyle | TextDecoration) => {
    if (field === FontStyle.BOLD) {
      setBold(!bold)
    } else if (field === FontStyle.ITALIC) {
      setItalic(!italic)
    } else if (field === TextDecoration.UNDERLINE) {
      setUnderline(!underline)
    }
    textareaRef?.current?.focus()
  }

  const handleTextAlignChange = () => {
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
        break
    }

    setTextAlign(newAlign)
    textareaRef?.current?.focus()
  }

  const FONT_STYLE_LIST = [
    {
      value: FontStyle.BOLD,
      ariaLabel: 'Toggle bold',
      Icon: Bold,
      onClick: () => handleFontStyleChange(FontStyle.BOLD),
    },
    {
      value: FontStyle.ITALIC,
      ariaLabel: 'Toggle italic',
      Icon: Italic,
      onClick: () => handleFontStyleChange(FontStyle.ITALIC),
    },
    {
      value: TextDecoration.UNDERLINE,
      ariaLabel: 'Toggle underline',
      Icon: Underline,
      onClick: () => handleFontStyleChange(TextDecoration.UNDERLINE),
    },
  ]

  const TEXT_ALIGN_OPTION = {
    value: textAlign,
    ariaLabel: 'Toggle alignment',
    Icon: {
      [TextAlign.LEFT]: AlignLeft,
      [TextAlign.CENTER]: AlignCenter,
      [TextAlign.RIGHT]: AlignRight,
    }[textAlign],
  }

  const FONT_SIZE_OPTIONS = [
    {
      value: 'decrease',
      ariaLabel: 'Decrease font size',
      Icon: AArrowDown,
      onClick: () => handleFontSizeChange(-2),
    },
    {
      value: 'increase',
      ariaLabel: 'Increase font size',
      Icon: AArrowUp,
      onClick: () => handleFontSizeChange(2),
    },
  ]

  const fontStyle = [
    bold ? FontStyle.BOLD : '',
    italic ? FontStyle.ITALIC : '',
    underline ? TextDecoration.UNDERLINE : '',
  ].filter(Boolean)

  const [width] = activeLayer!.getWidthHeight()
  const { scale } = activeLayer!.getOptions()
  const transform = renderer.getTransformMatrix()

  const inverseScale = DEFAULT_SCALE / (transform.scaleX / transform.initialScale)
  const menuScale =
    scale === DEFAULT_SCALE ? scale / inverseScale : transform.scaleX / transform.initialScale

  return (
    <div
      id="text-editor-menu"
      className={styles.menu}
      style={{
        top: `${position.y - 15 * menuScale}px`,
        left: `${position.x + (width * menuScale) / 2}px`,
      }}
    >
      <Menubar>
        {layerUi.showStickerColorPicker && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="cursor-pointer">
                  <span className="h-6 w-6" style={{ backgroundColor: layerUi.backgroundColor }} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <ColorTile onChange={handleBackgroundColorChange} />
              </DropdownMenuContent>
            </DropdownMenu>
            <Separator orientation="vertical" />
          </>
        )}

        <ToggleGroup type="multiple" size="sm" value={fontStyle} onValueChange={() => {}}>
          {FONT_STYLE_LIST.map(({ value, ariaLabel, Icon, onClick }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              aria-label={ariaLabel}
              className="cursor-pointer"
              onClick={onClick}
            >
              <Icon className="h-4 w-4" />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <Separator orientation="vertical" />

        <ToggleGroup type="single" value={textAlign} onValueChange={handleTextAlignChange}>
          <ToggleGroupItem
            value={TEXT_ALIGN_OPTION.value}
            aria-label={TEXT_ALIGN_OPTION.ariaLabel}
            className="cursor-pointer"
          >
            <TEXT_ALIGN_OPTION.Icon className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <Separator orientation="vertical" />

        <ToggleGroup type="multiple" size="sm">
          {FONT_SIZE_OPTIONS.map(({ value, ariaLabel, Icon, onClick }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              aria-label={ariaLabel}
              className="cursor-pointer"
              onClick={onClick}
            >
              <Icon className="h-6 w-6" strokeWidth={1.25} />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {layerUi.isTextArea && (
          <>
            <Separator orientation="vertical" />
            <ToggleGroup type="single">
              <ToggleGroupItem
                key="text-transformation"
                value="text-transformation"
                aria-label="Transform text"
                className="cursor-pointer"
                onClick={enableTextTransformation}
              >
                <Spline className="h-6 w-6" strokeWidth={1.25} />
              </ToggleGroupItem>
            </ToggleGroup>
          </>
        )}
      </Menubar>
    </div>
  )
}
