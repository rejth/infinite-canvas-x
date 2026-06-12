<script setup lang="ts">
import { Separator as SeparatorPrimitive } from 'reka-ui'
import { computed } from 'vue'

import { cn } from '@/shared/lib/utils'

const props = withDefaults(
  defineProps<{
    orientation?: 'horizontal' | 'vertical'
    decorative?: boolean
    class?: string
  }>(),
  {
    orientation: 'horizontal',
    decorative: true,
  },
)

const classes = computed(() =>
  cn(
    'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
    props.class,
  ),
)
</script>

<template>
  <SeparatorPrimitive
    data-slot="separator-root"
    :decorative="decorative"
    :orientation="orientation"
    :class="classes"
  />
</template>
