import Download from 'lucide-solid/icons/download'
import { createSignal, For, Show } from 'solid-js'

import type { ImageFilterState } from '@/shared/interfaces'
import { Button } from '@/ui/primitives/button/Button'
import { Select } from '@/ui/primitives/select/Select'
import { SelectContent } from '@/ui/primitives/select/SelectContent'
import { SelectTrigger } from '@/ui/primitives/select/SelectTrigger'
import { Slider } from '@/ui/primitives/slider/Slider'

import { Angle } from './icons/Angle'
import { Arch } from './icons/Arch'
import { Circle } from './icons/Circle'
import { Custom } from './icons/Custom'
import { Distort } from './icons/Distort'
import { Flag } from './icons/Flag'
import { Rise } from './icons/Rise'
import { Wave } from './icons/Wave'

import { useCanvasApp } from '@/adapters/solid/useCanvasApp'
import { useActiveLayer, useImageEditor, useLayerUi } from '@/store'

import './PropertiesSidebar.css'

const filterConfigs = [
  { key: 'brightness' as const, label: 'Brightness', min: 0, max: 100 },
  { key: 'contrast' as const, label: 'Contrast', min: 0, max: 100 },
  { key: 'saturation' as const, label: 'Saturation', min: 0, max: 100 },
  { key: 'vibrance' as const, label: 'Vibrance', min: 0, max: 100 },
  { key: 'hue' as const, label: 'Hue', min: 0, max: 100 },
  { key: 'blur' as const, label: 'Blur', min: 0, max: 100 },
  { key: 'noise' as const, label: 'Noise', min: 0, max: 100 },
  { key: 'pixelate' as const, label: 'Pixelate', min: 0, max: 100 },
]

const transformOptions = [
  { key: 'CUSTOM', icon: Custom, disabled: false },
  { key: 'DISTORT', icon: Distort, disabled: true },
  { key: 'CIRCLE', icon: Circle, disabled: true },
  { key: 'ANGLE', icon: Angle, disabled: true },
  { key: 'ARCH', icon: Arch, disabled: true },
  { key: 'RISE', icon: Rise, disabled: true },
  { key: 'WAVE', icon: Wave, disabled: true },
  { key: 'FLAG', icon: Flag, disabled: true },
]

function formatValue(key: keyof ImageFilterState, value: number): string {
  switch (key) {
    case 'brightness':
      return `${Math.round((value - 50) * 1.8)}%`
    case 'contrast':
      return `${Math.round((value - 50) * 2)}%`
    case 'saturation':
      return `${Math.round((value - 50) * 1.8)}%`
    case 'vibrance':
      return `${Math.round((value - 50) * 2)}%`
    case 'blur':
      return `${Math.round(value * 0.4)}%`
    case 'noise':
      return `${Math.round(value * 1.1)}%`
    case 'hue':
    case 'pixelate':
      return Math.round(value / 50).toString()
    default:
      return value.toString()
  }
}

export function PropertiesSidebar() {
  const getApp = useCanvasApp()
  const layerUi = useLayerUi()
  const activeLayer = useActiveLayer()
  const imageEditor = useImageEditor()

  const [fontFamily, setFontFamily] = createSignal('Arial')
  const [selectedTransform, setSelectedTransform] = createSignal('CUSTOM')

  function updateFilter(key: keyof ImageFilterState, sliderValue: number[]) {
    getApp()?.applyActiveImageFilter(key, sliderValue[0])
  }

  function updateOpacity(sliderValue: number[]) {
    getApp()?.setActiveLayerOpacityPercent(sliderValue[0])
  }

  function enableTextTransformation() {
    getApp()?.transformActiveTextToSpline()
  }

  return (
    <Show when={layerUi().canShowSidebar}>
      <div class="fixed top-0 right-0 h-full w-56 bg-white border-l border-gray-200 z-50">
        <div class="p-3 h-full overflow-y-auto">
          <div class="border-b border-gray-200 mb-3">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  class="text-gray-600 hover:text-gray-900 hover:bg-gray-100 size-7 cursor-pointer"
                >
                  <Download class="size-4" />
                </Button>
              </div>
            </div>
          </div>

          <div class="border-gray-200 pb-4">
            <div class="space-y-3">
              <h3 class="text-gray-900 text-base font-medium">Layer</h3>
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-gray-900 text-xs font-normal">Opacity</span>
                  <span class="text-gray-900 text-xs font-normal">{activeLayer().opacity}%</span>
                </div>
                <Slider
                  value={[activeLayer().opacity]}
                  min={0}
                  max={100}
                  step={1}
                  class="cursor-pointer w-full [&_[data-slot=slider-track]]:bg-gray-300 [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-range]]:bg-gray-900 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-gray-900 [&_[data-slot=slider-thumb]]:size-2.5 [&_[data-slot=slider-thumb]]:shadow-lg"
                  onValueChange={updateOpacity}
                />
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <Show when={layerUi().showTextSidebar}>
              <div class="border-t border-gray-200 pt-4">
                <div class="space-y-3">
                  <h3 class="text-gray-900 text-base font-medium">Text Style</h3>
                  <Select
                    value={fontFamily()}
                    onChange={setFontFamily}
                    disabled
                    options={['Arial', 'Helvetica', 'Times']}
                  >
                    <SelectTrigger
                      value={fontFamily()}
                      class="w-full bg-white border-gray-300 text-gray-900 h-8 text-sm cursor-pointer"
                    />
                    <SelectContent />
                  </Select>
                </div>
              </div>

              <div class="border-t border-gray-200 pt-4">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-gray-900 text-base font-medium">Text Transformations</h3>
                </div>
                <div class="space-y-3">
                  <div class="grid grid-cols-4 gap-1.5">
                    <For each={transformOptions}>
                      {(option) => (
                        <Button
                          variant={selectedTransform() === option.key ? 'default' : 'outline'}
                          size="sm"
                          disabled={option.disabled}
                          class={`transformation-button h-12 text-xs font-medium cursor-pointer ${
                            selectedTransform() === option.key
                              ? 'bg-blue-100 text-gray-900 border-2 border-blue-500 hover:bg-blue-100'
                              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                          }`}
                          onClick={() => setSelectedTransform(option.key)}
                        >
                          <option.icon />
                        </Button>
                      )}
                    </For>
                  </div>
                  <div class="grid grid-cols-2 gap-1.5 pt-1">
                    <Button
                      variant="outline"
                      disabled
                      class="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 h-7 text-xs cursor-pointer"
                    >
                      Reset
                    </Button>
                    <Button
                      class="bg-gray-900 text-white border-gray-900 hover:bg-gray-900 hover:text-white h-7 text-xs cursor-pointer"
                      variant="outline"
                      disabled={!layerUi().showTextSidebar}
                      onClick={enableTextTransformation}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </Show>

            <Show when={layerUi().hasImage}>
              <div class="border-t border-gray-200 pt-4">
                <div class="flex items-center justify-between">
                  <h2 class="text-gray-900 text-base font-medium">Photo Filter</h2>
                </div>
              </div>
              <For each={filterConfigs}>
                {(config) => (
                  <div class="space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-gray-900 text-xs font-normal">{config.label}</span>
                      <span class="text-gray-900 text-xs font-normal">
                        {formatValue(config.key, imageEditor().filters[config.key])}
                      </span>
                    </div>
                    <Slider
                      value={[imageEditor().filters[config.key]]}
                      min={config.min}
                      max={config.max}
                      step={1}
                      class="cursor-pointer w-full [&_[data-slot=slider-track]]:bg-gray-300 [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-range]]:bg-gray-900 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-gray-900 [&_[data-slot=slider-thumb]]:size-2.5 [&_[data-slot=slider-thumb]]:shadow-lg"
                      onValueChange={(v) => updateFilter(config.key, v)}
                    />
                  </div>
                )}
              </For>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  )
}
