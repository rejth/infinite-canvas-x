<script lang="ts">
import { Slider } from 'bits-ui'

import { cn } from '@/shared/lib/utils'

type Props = {
  value?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  class?: string
}

let { value = [0], onValueChange, min = 0, max = 100, step = 1, class: className }: Props = $props()

const sliderValue = $derived(value[0])

function handleValueChange(nextValue: number) {
  onValueChange?.([nextValue])
}
</script>

<Slider.Root
  data-slot="slider"
  type="single"
  value={sliderValue}
  onValueChange={handleValueChange}
  {min}
  {max}
  {step}
  class={cn(
    'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50',
    className,
  )}
>
  <span
    data-slot="slider-track"
    class="bg-muted relative grow overflow-hidden rounded-full h-1.5 w-full"
  >
    <Slider.Range data-slot="slider-range" class="bg-primary absolute h-full" />
  </span>
  <Slider.Thumb
    index={0}
    data-slot="slider-thumb"
    class="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
  />
</Slider.Root>
