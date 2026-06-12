<script lang="ts">
import { DropdownMenu } from 'bits-ui'
import type { Snippet } from 'svelte'

let { children }: { children?: Snippet } = $props()
</script>

<DropdownMenu.Trigger data-slot="dropdown-menu-trigger">
  {#snippet child({ props })}
    <div {...props}>
      {@render children?.()}
    </div>
  {/snippet}
</DropdownMenu.Trigger>
