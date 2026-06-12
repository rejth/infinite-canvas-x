<script setup lang="ts">
import { cn } from '@/shared/lib/utils'

defineProps<{
  name: string
  color?: string
}>()
</script>

<template>
  <svg width="100%" height="100%" :class="cn('block', color)">
    <use :href="`#${name}`" />
  </svg>
</template>
