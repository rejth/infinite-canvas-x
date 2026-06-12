<script setup lang="ts">
import { ToggleGroupRoot } from 'reka-ui'
import { computed, provide } from 'vue'

import { cn } from '@/shared/lib/utils'

import type { ToggleVariants } from './toggleVariants'

const props = withDefaults(
  defineProps<{
    type?: 'single' | 'multiple'
    modelValue?: string | string[]
    variant?: ToggleVariants['variant']
    size?: ToggleVariants['size']
    class?: string
  }>(),
  {
    type: 'single',
    variant: 'default',
    size: 'default',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

provide('toggleGroupContext', { variant: props.variant, size: props.size })

const rootClasses = computed(() =>
  cn(
    'group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs',
    props.class,
  ),
)
</script>

<template>
  <ToggleGroupRoot
    data-slot="toggle-group"
    :type="type"
    :model-value="modelValue"
    :data-variant="variant"
    :data-size="size"
    :class="rootClasses"
    @update:model-value="emit('update:modelValue', $event as string & string[])"
  >
    <slot />
  </ToggleGroupRoot>
</template>
