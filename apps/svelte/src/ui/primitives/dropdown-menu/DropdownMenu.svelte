<script lang="ts">
import { DropdownMenu } from 'bits-ui'
import type { Snippet } from 'svelte'

type Props = {
  open?: boolean
  children?: Snippet
}

let { open = $bindable(false), children }: Props = $props()
</script>

<DropdownMenu.Root bind:open>
  {@render children?.()}
</DropdownMenu.Root>
