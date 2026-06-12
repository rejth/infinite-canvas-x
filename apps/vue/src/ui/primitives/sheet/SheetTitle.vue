<script setup lang="ts">
import { DialogTitle } from 'reka-ui'
import { computed } from 'vue'

import { cn } from '@/shared/lib/utils'

const props = defineProps<{ class?: string }>()
const classes = computed(() => cn('text-foreground font-semibold', props.class))
</script>

<template>
  <DialogTitle data-slot="sheet-title" :class="classes">
    <slot />
  </DialogTitle>
</template>
