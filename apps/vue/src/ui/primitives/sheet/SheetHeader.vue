<script setup lang="ts">
import { computed } from 'vue'

import { cn } from '@/shared/lib/utils'

const props = defineProps<{ class?: string }>()
const classes = computed(() => cn('flex flex-col gap-1.5 p-4', props.class))
</script>

<template>
  <div data-slot="sheet-header" :class="classes">
    <slot />
  </div>
</template>
