<script setup lang="ts">
import { useCssModule } from 'vue'

import { COLOR_LIST, Colors } from '@/shared/constants'

const styles = useCssModule()

const emit = defineEmits<{
  change: [color: Colors]
}>()

function handleColorChange(value: string) {
  emit('change', value as Colors)
}
</script>

<template>
  <div :class="[styles.colors, styles.iconGroup]">
    <span
      v-for="{ value } in COLOR_LIST"
      :key="value"
      tabindex="0"
      role="button"
      :class="[styles.icon, styles.color]"
      :style="{ backgroundColor: value }"
      @click="handleColorChange(value)"
    />
    <span
      tabindex="0"
      role="button"
      :class="[styles.icon, styles.color, styles.transparent]"
      @click="handleColorChange('transparent')"
    />
  </div>
</template>

<style module>
.colors {
  grid-template-columns: repeat(5, 1fr);
  cursor: pointer;
}

.iconGroup {
  display: inline-grid;
  grid-column-gap: 0.5em;
  grid-row-gap: 0.5em;
}

.icon.color {
  height: 1.13em;
  width: 1.13em;
  display: inline-block;
  font-size: 2em;
}

.transparent {
  border: 1px solid #eeeeee;
  background: repeating-conic-gradient(#dddddd 0% 25%, transparent 0% 50%) 50% / 0.5em 0.5em;
}
</style>
