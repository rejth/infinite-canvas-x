<script setup lang="ts">
import { SelectRoot } from 'reka-ui'

defineProps<{
  modelValue?: string
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <SelectRoot
    data-slot="select"
    :model-value="modelValue"
    :disabled="disabled"
    @update:model-value="emit('update:modelValue', $event ?? '')"
  >
    <slot />
  </SelectRoot>
</template>
