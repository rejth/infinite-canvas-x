<script setup lang="ts">
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'
import { computed } from 'vue'

import { cn } from '@/shared/lib/utils'

const props = withDefaults(
  defineProps<{
    modelValue?: number[]
    defaultValue?: number[]
    min?: number
    max?: number
    step?: number
    class?: string
  }>(),
  {
    min: 0,
    max: 100,
    step: 1,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const thumbCount = computed(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue.length
  if (Array.isArray(props.defaultValue)) return props.defaultValue.length
  return 1
})

const rootClass = computed(() =>
  cn(
    'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50',
    props.class,
  ),
)
</script>

<template>
  <SliderRoot
    data-slot="slider"
    :model-value="modelValue"
    :default-value="defaultValue"
    :min="min"
    :max="max"
    :step="step"
    :class="rootClass"
    @update:model-value="(v) => v && emit('update:modelValue', v)"
  >
    <SliderTrack
      data-slot="slider-track"
      class="bg-muted relative grow overflow-hidden rounded-full h-1.5 w-full"
    >
      <SliderRange data-slot="slider-range" class="bg-primary absolute h-full" />
    </SliderTrack>
    <SliderThumb
      v-for="i in thumbCount"
      :key="i"
      data-slot="slider-thumb"
      class="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
    />
  </SliderRoot>
</template>
