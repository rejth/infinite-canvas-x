<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import { SelectIcon, SelectTrigger, SelectValue } from 'reka-ui'
import { computed } from 'vue'

import { cn } from '@/shared/lib/utils'

const props = defineProps<{ class?: string }>()

const classes = computed(() =>
  cn(
    "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 h-9",
    props.class,
  ),
)
</script>

<template>
  <SelectTrigger data-slot="select-trigger" :class="classes">
    <SelectValue />
    <SelectIcon as-child>
      <ChevronDown class="size-4 opacity-50" />
    </SelectIcon>
  </SelectTrigger>
</template>
