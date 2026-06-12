<script lang="ts">
import { Dialog } from 'bits-ui'
import type { Snippet } from 'svelte'

type Props = {
  open?: boolean
  children?: Snippet
}

let { open = $bindable(false), children }: Props = $props()
</script>

<Dialog.Root bind:open>
  {@render children?.()}
</Dialog.Root>
