import { useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AArrowDown,
  AArrowUp,
  Bold,
  Italic,
  Underline,
  Spline,
} from 'lucide-react';

import { Button } from '@/app/ui/primitives/button';
import { Menubar } from '@/app/ui/primitives/menubar';
import { Separator } from '@/app/ui/primitives/separator';
import { ToggleGroup, ToggleGroupItem } from '@/app/ui/primitives/toggle-group';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/app/ui/primitives/dropdown-menu';

import { Tools } from '@/app/shared/interfaces';
import { Colors } from '@/app/shared/constants';
import { useTextEditorContext, useActiveLayerContext, useCanvasContext, useToolbarContext } from '@/app/store';

import { DEFAULT_SCALE } from '@/core/constants';
import { FontStyle, TextAlign, TextDecoration } from '@/core/interfaces';
import { CanvasEntitySubtype, CanvasEntityType } from '@/core/entities/interfaces';
import { isCanvasRect } from '@/core/entities/lib';
import { Point } from '@/core/entities/Point';

import { ColorTile } from '../ColorTile/ColorTile';

import styles from './TextEditorMenu.module.css';

interface TextEditorMenuProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  position: Point;
  onFontSizeChange: (fontSize: number) => void;
}

export const TextEditorMenu = ({ textareaRef, position, onFontSizeChange }: TextEditorMenuProps) => {
  const { renderer, renderManager } = useCanvasContext();
  const { activeLayer, setActiveLayer } = useActiveLayerContext();
  const { setTool } = useToolbarContext();
  const { text, textAlign, fontSize, bold, italic, underline, ...actions } = useTextEditorContext();
  const { setTextAlign, setFontSize, setBold, setItalic, setUnderline, resetTextEditor } = actions;

  const [backgroundColor, setBackgroundColor] = useState(() => {
    const rect = activeLayer?.getChildByType(CanvasEntityType.RECT);
    if (rect && isCanvasRect(rect)) return rect.getOptions().color;
    return Colors.TRANSPARENT;
  });

  if (!activeLayer || !renderer || !renderManager) return null;

  const handleBackgroundColorChange = (color: Colors) => {
    if (!activeLayer) return;

    const rect = activeLayer.getChildByType(CanvasEntityType.RECT);
    if (!rect || !isCanvasRect(rect)) return;

    rect.setOptions({ color });
    setBackgroundColor(color);

    renderManager?.reDrawOnNextFrame({
      exceptLayer: activeLayer,
      callBack: () => {
        renderManager?.drawLayer(activeLayer, { exceptType: CanvasEntityType.TEXT });
      },
    });
  };

  const enableTextTransformation = () => {
    const rect = activeLayer.getChildByType(CanvasEntityType.RECT);
    if (!text || !rect || !isCanvasRect(rect)) return;

    const newLayer = rect.enableTextTransformation(text);
    renderManager.removeLayer(activeLayer);
    renderManager.addLayer(newLayer);

    resetTextEditor();
    setActiveLayer(newLayer);
    setTool(Tools.SELECT);
  };

  const handleFontSizeChange = (value: number) => {
    const newFontSize = fontSize + value;
    setFontSize(newFontSize);
    onFontSizeChange(newFontSize);
    textareaRef?.current?.focus();
  };

  const handleFontStyleChange = (field: FontStyle | TextDecoration) => {
    if (field === FontStyle.BOLD) {
      setBold((state) => !state);
    } else if (field === FontStyle.ITALIC) {
      setItalic((state) => !state);
    } else if (field === TextDecoration.UNDERLINE) {
      setUnderline((state) => !state);
    }
    textareaRef?.current?.focus();
  };

  const handleTextAlignChange = () => {
    let newAlign: TextAlign;

    switch (textAlign) {
      case TextAlign.LEFT:
        newAlign = TextAlign.CENTER;
        break;
      case TextAlign.CENTER:
        newAlign = TextAlign.RIGHT;
        break;
      default:
        newAlign = TextAlign.LEFT;
        break;
    }

    setTextAlign(newAlign);
    textareaRef?.current?.focus();
  };

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
  ];

  const TEXT_ALIGN_OPTION = {
    value: textAlign,
    ariaLabel: 'Toggle alignment',
    Icon: { [TextAlign.LEFT]: AlignLeft, [TextAlign.CENTER]: AlignCenter, [TextAlign.RIGHT]: AlignRight }[textAlign],
  };

  const FONT_SIZE_OPTIONS = [
    { value: 'decrease', ariaLabel: 'Decrease font size', Icon: AArrowDown, onClick: () => handleFontSizeChange(-2) },
    { value: 'increase', ariaLabel: 'Increase font size', Icon: AArrowUp, onClick: () => handleFontSizeChange(2) },
  ];

  const fontStyle = [
    bold ? FontStyle.BOLD : '',
    italic ? FontStyle.ITALIC : '',
    underline ? TextDecoration.UNDERLINE : '',
  ].filter(Boolean);

  const [width] = activeLayer.getWidthHeight();
  const { scale } = activeLayer.getOptions();
  const transform = renderer.getTransformMatrix();

  const inverseScale = DEFAULT_SCALE / (transform.scaleX / transform.initialScale);
  const menuScale = scale === DEFAULT_SCALE ? scale / inverseScale : transform.scaleX / transform.initialScale;

  const rect = activeLayer?.getChildByType(CanvasEntityType.RECT);
  const isTextArea = rect && isCanvasRect(rect) && rect.getSubtype() === CanvasEntitySubtype.TEXT;

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
        {!isTextArea && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="cursor-pointer">
                  <span className="h-6 w-6" style={{ backgroundColor }} />
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

        {isTextArea && (
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
  );
};
