<script setup lang="ts">
import { SelectContent, SelectPortal, SelectViewport } from 'reka-ui'
import { computed } from 'vue'

import { cn } from '@/shared/lib/utils'

const props = defineProps<{ class?: string }>()

const classes = computed(() =>
  cn(
    'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md',
    props.class,
  ),
)
</script>

<template>
  <SelectPortal>
    <SelectContent data-slot="select-content" :class="classes">
      <SelectViewport class="p-1">
        <slot />
      </SelectViewport>
    </SelectContent>
  </SelectPortal>
</template>
