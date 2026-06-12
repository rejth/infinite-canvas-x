import { Slider as SliderPrimitive } from '@kobalte/core/slider'
import { splitProps } from 'solid-js'

import { cn } from '@/shared/lib/utils'

export type SliderProps = {
  value?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  class?: string
}

export function Slider(props: SliderProps) {
  const [local, rest] = splitProps(props, ['value', 'onValueChange', 'min', 'max', 'step', 'class'])

  const handleChange = (value: number[]) => {
    local.onValueChange?.(value)
  }

  return (
    <SliderPrimitive
      data-slot="slider"
      value={local.value ?? [0]}
      onChange={handleChange}
      minValue={local.min ?? 0}
      maxValue={local.max ?? 100}
      step={local.step ?? 1}
      class={cn(
        'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50',
        local.class,
      )}
      {...rest}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        class="bg-muted relative grow overflow-hidden rounded-full h-1.5 w-full"
      >
        <SliderPrimitive.Fill data-slot="slider-range" class="bg-primary absolute h-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        class="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
      />
    </SliderPrimitive>
  )
}
