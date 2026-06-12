<script lang="ts">
import { Download } from 'lucide-svelte'

import type { ImageFilterState } from '@/shared/interfaces'
import Button from '@/ui/primitives/button/Button.svelte'
import Select from '@/ui/primitives/select/Select.svelte'
import SelectContent from '@/ui/primitives/select/SelectContent.svelte'
import SelectItem from '@/ui/primitives/select/SelectItem.svelte'
import SelectTrigger from '@/ui/primitives/select/SelectTrigger.svelte'
import Slider from '@/ui/primitives/slider/Slider.svelte'

import AngleIcon from './icons/Angle.svelte'
import ArchIcon from './icons/Arch.svelte'
import CircleIcon from './icons/Circle.svelte'
import CustomIcon from './icons/Custom.svelte'
import DistortIcon from './icons/Distort.svelte'
import FlagIcon from './icons/Flag.svelte'
import RiseIcon from './icons/Rise.svelte'
import WaveIcon from './icons/Wave.svelte'

import { useCanvasApp } from '@/adapters/svelte/useCanvasApp.svelte'
import { useActiveLayer, useImageEditor, useLayerUi } from '@/store/index.svelte'

const getApp = useCanvasApp()
const getLayerUi = useLayerUi()
const getActiveLayer = useActiveLayer()
const getImageEditor = useImageEditor()

let fontFamily = $state('Arial')
let selectedTransform = $state('CUSTOM')

const layerUi = $derived(getLayerUi())
const opacity = $derived(getActiveLayer().opacity)
const filters = $derived(getImageEditor().filters)

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
  { key: 'CUSTOM', icon: CustomIcon, disabled: false },
  { key: 'DISTORT', icon: DistortIcon, disabled: true },
  { key: 'CIRCLE', icon: CircleIcon, disabled: true },
  { key: 'ANGLE', icon: AngleIcon, disabled: true },
  { key: 'ARCH', icon: ArchIcon, disabled: true },
  { key: 'RISE', icon: RiseIcon, disabled: true },
  { key: 'WAVE', icon: WaveIcon, disabled: true },
  { key: 'FLAG', icon: FlagIcon, disabled: true },
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

function updateFilter(key: keyof ImageFilterState, sliderValue: number[]) {
  getApp()?.applyActiveImageFilter(key, sliderValue[0])
}

function updateOpacity(sliderValue: number[]) {
  getApp()?.setActiveLayerOpacityPercent(sliderValue[0])
}

function enableTextTransformation() {
  getApp()?.transformActiveTextToSpline()
}
</script>

{#if layerUi.canShowSidebar}
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
              <span class="text-gray-900 text-xs font-normal">{opacity}%</span>
            </div>
            <Slider
              value={[opacity]}
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
        {#if layerUi.showTextSidebar}
          <div class="border-t border-gray-200 pt-4">
            <div class="space-y-3">
              <h3 class="text-gray-900 text-base font-medium">Text Style</h3>
              <Select bind:value={fontFamily} disabled>
                <SelectTrigger
                  value={fontFamily}
                  class="w-full bg-white border-gray-300 text-gray-900 h-8 text-sm cursor-pointer"
                />
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Times">Times</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-gray-900 text-base font-medium">Text Transformations</h3>
            </div>
            <div class="space-y-3">
              <div class="grid grid-cols-4 gap-1.5">
                {#each transformOptions as option (option.key)}
                  <Button
                    variant={selectedTransform === option.key ? 'default' : 'outline'}
                    size="sm"
                    disabled={option.disabled}
                    class="transformation-button h-12 text-xs font-medium cursor-pointer {selectedTransform ===
                    option.key
                      ? 'bg-blue-100 text-gray-900 border-2 border-blue-500 hover:bg-blue-100'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}"
                    onclick={() => (selectedTransform = option.key)}
                  >
                    <option.icon />
                  </Button>
                {/each}
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
                  disabled={!layerUi.showTextSidebar}
                  onclick={enableTextTransformation}
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>
        {/if}

        {#if layerUi.hasImage}
          <div class="border-t border-gray-200 pt-4">
            <div class="flex items-center justify-between">
              <h2 class="text-gray-900 text-base font-medium">Photo Filter</h2>
            </div>
          </div>
          {#each filterConfigs as { key, label, min, max } (key)}
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-gray-900 text-xs font-normal">{label}</span>
                <span class="text-gray-900 text-xs font-normal">
                  {formatValue(key, filters[key])}
                </span>
              </div>
              <Slider
                value={[filters[key]]}
                {min}
                {max}
                step={1}
                class="cursor-pointer w-full [&_[data-slot=slider-track]]:bg-gray-300 [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-range]]:bg-gray-900 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-gray-900 [&_[data-slot=slider-thumb]]:size-2.5 [&_[data-slot=slider-thumb]]:shadow-lg"
                onValueChange={(v) => updateFilter(key, v)}
              />
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  :global(.transformation-button svg:not([class*='size-'])) {
    width: revert !important;
    height: revert !important;
  }
</style>
