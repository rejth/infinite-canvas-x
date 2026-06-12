<script lang="ts">
import { COLOR_LIST, Colors } from '@/shared/constants'

type Props = {
  onchange: (color: Colors) => void
}

let { onchange }: Props = $props()

function handleColorChange(value: string) {
  onchange(value as Colors)
}
</script>

<div class="colors icon-group">
  {#each COLOR_LIST as { value } (value)}
    <button
      type="button"
      class="icon color"
      style:background-color={value}
      aria-label={`Select color ${value}`}
      onclick={() => handleColorChange(value)}
    ></button>
  {/each}
  <button
    type="button"
    class="icon color transparent"
    aria-label="Select transparent color"
    onclick={() => handleColorChange('transparent')}
  ></button>
</div>

<style>
  .colors {
    grid-template-columns: repeat(5, 1fr);
    cursor: pointer;
  }

  .icon-group {
    display: inline-grid;
    grid-column-gap: 0.5em;
    grid-row-gap: 0.5em;
  }

  .icon.color {
    height: 1.13em;
    width: 1.13em;
    display: inline-block;
    font-size: 2em;
    padding: 0;
    border: none;
    cursor: pointer;
  }

  .transparent {
    border: 1px solid #eeeeee;
    background: repeating-conic-gradient(#dddddd 0% 25%, transparent 0% 50%) 50% / 0.5em 0.5em;
  }
</style>
