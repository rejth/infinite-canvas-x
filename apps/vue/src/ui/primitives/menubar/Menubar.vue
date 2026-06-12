<script setup lang="ts">
import { MenubarRoot } from 'reka-ui'
import { computed } from 'vue'

import { cn } from '@/shared/lib/utils'

const props = defineProps<{ class?: string }>()

const classes = computed(() =>
  cn('bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs', props.class),
)
</script>

<template>
  <MenubarRoot data-slot="menubar" :class="classes">
    <slot />
  </MenubarRoot>
</template>
