<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { SelectItem, SelectItemIndicator, SelectItemText } from 'reka-ui'
import { computed } from 'vue'

import { cn } from '@/shared/lib/utils'

const props = defineProps<{
  value: string
  class?: string
}>()

const classes = computed(() =>
  cn(
    'focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    props.class,
  ),
)
</script>

<template>
  <SelectItem data-slot="select-item" :value="value" :class="classes">
    <span class="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectItemIndicator>
        <Check class="size-4" />
      </SelectItemIndicator>
    </span>
    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
