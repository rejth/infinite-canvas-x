<script setup lang="ts">
import { ToggleGroupItem } from 'reka-ui'
import { computed, inject } from 'vue'

import { cn } from '@/shared/lib/utils'

import { toggleItemClasses } from './toggleVariants'

const props = defineProps<{
  value: string
  class?: string
}>()

const context = inject<{ variant?: 'default' | 'outline'; size?: 'default' | 'sm' | 'lg' }>(
  'toggleGroupContext',
  {},
)

const classes = computed(() =>
  toggleItemClasses(context.variant, context.size, cn('cursor-pointer', props.class)),
)
</script>

<template>
  <ToggleGroupItem data-slot="toggle-group-item" :value="value" :class="classes">
    <slot />
  </ToggleGroupItem>
</template>
