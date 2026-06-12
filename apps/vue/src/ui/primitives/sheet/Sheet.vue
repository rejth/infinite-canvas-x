<script setup lang="ts">
import { DialogRoot } from 'reka-ui'

defineProps<{ open?: boolean }>()
const emit = defineEmits<{ 'update:open': [open: boolean] }>()
</script>

<template>
  <DialogRoot data-slot="sheet" :open="open" @update:open="emit('update:open', $event)">
    <slot />
  </DialogRoot>
</template>
