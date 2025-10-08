import { useState } from 'react';
import { Download } from 'lucide-react';

import { CanvasEntityType } from '@/entities/interfaces';
import { isCanvasImage, isCanvasRect } from '@/entities/lib';
import { RectSubtype } from '@/entities/CanvasRect';

import { Tools } from '@/shared/interfaces';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
  useActiveLayerContext,
  useCanvasContext,
  useImageEditorContext,
  useTextEditorContext,
  useToolbarContext,
} from '@/context';
import { ImageFilterState } from '@/context/ImageEditorContext/ImageEditorContext';

import { Custom } from './assets/Custom';
import { Distort } from './assets/Distort';
import { Angle } from './assets/Angle';
import { Arch } from './assets/Arch';
import { Rise } from './assets/Rise';
import { Wave } from './assets/Wave';
import { Flag } from './assets/Flag';
import { Circle } from './assets/Circle';

import './PropertiesSidebar.css';

interface TextStyleState {
  font: string;
}

const filterConfigs = [
  { key: 'brightness' as const, label: 'Brightness', min: 0, max: 100 },
  { key: 'contrast' as const, label: 'Contrast', min: 0, max: 100 },
  { key: 'saturation' as const, label: 'Saturation', min: 0, max: 100 },
  { key: 'vibrance' as const, label: 'Vibrance', min: 0, max: 100 },
  { key: 'hue' as const, label: 'Hue', min: 0, max: 100 },
  { key: 'blur' as const, label: 'Blur', min: 0, max: 100 },
  { key: 'noise' as const, label: 'Noise', min: 0, max: 100 },
  { key: 'pixelate' as const, label: 'Pixelate', min: 0, max: 100 },
];

const transformOptions = [
  { key: 'CUSTOM', icon: Custom, disabled: false },
  { key: 'DISTORT', icon: Distort, disabled: true },
  { key: 'CIRCLE', icon: Circle, disabled: true },
  { key: 'ANGLE', icon: Angle, disabled: true },
  { key: 'ARCH', icon: Arch, disabled: true },
  { key: 'RISE', icon: Rise, disabled: true },
  { key: 'WAVE', icon: Wave, disabled: true },
  { key: 'FLAG', icon: Flag, disabled: true },
];

const formatValue = (key: keyof ImageFilterState, value: number): string => {
  switch (key) {
    case 'brightness':
      return `${Math.round((value - 50) * 1.8)}%`;
    case 'contrast':
      return `${Math.round((value - 50) * 2)}%`;
    case 'saturation':
      return `${Math.round((value - 50) * 1.8)}%`;
    case 'vibrance':
      return `${Math.round((value - 50) * 2)}%`;
    case 'blur':
      return `${Math.round(value * 0.4)}%`;
    case 'noise':
      return `${Math.round(value * 1.1)}%`;
    case 'hue':
    case 'pixelate':
      return Math.round(value / 50).toString();
    default:
      return value.toString();
  }
};

export function PropertiesSidebar() {
  const { renderManager } = useCanvasContext();
  const { setTool } = useToolbarContext();
  const { filters, setFilters } = useImageEditorContext();
  const { text, resetTextEditor } = useTextEditorContext();
  const { activeLayer, opacity, setOpacity, setActiveLayer } = useActiveLayerContext();

  const [textStyle, setTextStyle] = useState<TextStyleState>({ font: 'Arial' });

  const [selectedTransform, setSelectedTransform] = useState('CUSTOM');

  if (!renderManager) return null;

  const updateFilter = (key: keyof ImageFilterState, value: number[]) => {
    const activeImage = activeLayer?.getChildByType(CanvasEntityType.IMAGE);
    if (!activeImage || !isCanvasImage(activeImage)) return;

    const newValue = value[0];
    activeImage.applyFilters({ [key]: newValue });
    setFilters({ [key]: newValue });

    renderManager.reDrawOnNextFrame();
  };

  const updateOpacity = (value: number[]) => {
    if (!activeLayer) return;

    const newValue = value[0];
    activeLayer.setOpacity(newValue / 100);
    setOpacity(newValue);

    renderManager.reDrawOnNextFrame();
  };

  const enableTextTransformation = () => {
    if (!activeLayer) return;
    const rect = activeLayer.getChildByType(CanvasEntityType.RECT);
    const isTextArea = rect && isCanvasRect(rect) && rect.subtype === RectSubtype.TEXT;
    if (!isTextArea) return;

    const textChild = activeLayer.getChildByType(CanvasEntityType.TEXT);
    const renderedText = textChild?.getOptions().text;
    const finalText = renderedText || text;
    if (!finalText || !rect || !isCanvasRect(rect) || !isTextArea) return;

    const layer = rect.enableTextTransformation(finalText);
    renderManager.removeLayer(activeLayer);
    renderManager.addLayer(layer);

    resetTextEditor();
    setActiveLayer(layer);
    setTool(Tools.SELECT);
  };

  const image = activeLayer?.getChildByType(CanvasEntityType.IMAGE);
  const rect = activeLayer?.getChildByType(CanvasEntityType.RECT);
  const spline = activeLayer?.getChildByType(CanvasEntityType.SPLINE);
  const showTextSidebar = spline || (rect && isCanvasRect(rect) && rect.subtype === RectSubtype.TEXT);

  return (
    <div className="fixed top-0 right-0 h-full w-56 bg-white border-l border-gray-200 z-50">
      <div className="p-3 h-full overflow-y-auto">
        {/* Header controls */}
        <div className="border-b border-gray-200 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 size-7 cursor-pointer"
              >
                <Download className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Layer */}
        <div className="border-gray-200 pb-4">
          <div className="space-y-3">
            <h3 className="text-gray-900 text-base font-medium">Layer</h3>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-gray-900 text-xs font-normal">Opacity</label>
                <span className="text-gray-900 text-xs font-normal">{opacity}%</span>
              </div>

              <div className="relative">
                <Slider
                  value={[opacity]}
                  onValueChange={updateOpacity}
                  min={0}
                  max={100}
                  step={1}
                  className="cursor-pointer w-full [&_[data-slot=slider-track]]:bg-gray-300 [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-range]]:bg-gray-900 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-gray-900 [&_[data-slot=slider-thumb]]:size-2.5 [&_[data-slot=slider-thumb]]:shadow-lg [&_[data-slot=slider-thumb]]:ring-0 [&_[data-slot=slider-thumb]:hover]:ring-0 [&_[data-slot=slider-thumb]:focus-visible]:ring-0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {showTextSidebar && (
            <>
              {/* Text Style */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-3">
                  <h3 className="text-gray-900 text-base font-medium">Text Style</h3>

                  <Select
                    value={textStyle.font}
                    disabled={true}
                    onValueChange={(value) => setTextStyle((prev) => ({ ...prev, font: value }))}
                  >
                    <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900 h-8 text-sm cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times">Times</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Text Transformations */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-900 text-base font-medium">Text Transformations</h3>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-1.5">
                    {transformOptions.map(({ key, icon: Icon, disabled }) => (
                      <Button
                        key={key}
                        variant={selectedTransform === key ? 'default' : 'outline'}
                        size="sm"
                        disabled={disabled}
                        onClick={() => setSelectedTransform(key)}
                        className={`transformation-button h-12 text-xs font-medium cursor-pointer ${
                          selectedTransform === key
                            ? 'bg-blue-100 text-gray-900 border-2 border-blue-500 hover:bg-blue-100' // Light blue background with strong blue border for selected state
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        <Icon />
                      </Button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <Button
                      variant="outline"
                      disabled={true}
                      className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 h-7 text-xs cursor-pointer"
                    >
                      Reset
                    </Button>
                    <Button
                      className="bg-gray-900 text-white border-gray-900 hover:bg-gray-900 hover:text-white h-7 text-xs cursor-pointer"
                      variant="outline"
                      disabled={!showTextSidebar}
                      onClick={enableTextTransformation}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Photo Filter */}
          {Boolean(image) && (
            <>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-gray-900 text-base font-medium">Photo Filter</h2>
                </div>
              </div>
              {filterConfigs.map(({ key, label, min, max }) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-900 text-xs font-normal">{label}</label>
                    <span className="text-gray-900 text-xs font-normal">{formatValue(key, filters[key])}</span>
                  </div>

                  <div className="relative">
                    <Slider
                      value={[filters[key]]}
                      onValueChange={(value) => updateFilter(key, value)}
                      min={min}
                      max={max}
                      step={1}
                      className="cursor-pointer w-full [&_[data-slot=slider-track]]:bg-gray-300 [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-range]]:bg-gray-900 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-gray-900 [&_[data-slot=slider-thumb]]:size-2.5 [&_[data-slot=slider-thumb]]:shadow-lg [&_[data-slot=slider-thumb]]:ring-0 [&_[data-slot=slider-thumb]:hover]:ring-0 [&_[data-slot=slider-thumb]:focus-visible]:ring-0"
                    />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
