<script lang="ts">
import { Select } from 'bits-ui'
import type { Snippet } from 'svelte'

type Props = {
  value?: string
  disabled?: boolean
  children?: Snippet
}

let { value = $bindable(''), disabled = false, children }: Props = $props()
</script>

<Select.Root type="single" bind:value {disabled}>
  {@render children?.()}
</Select.Root>
