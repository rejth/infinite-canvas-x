<script lang="ts">
import { Menubar as MenubarPrimitive } from 'bits-ui'
import type { Snippet } from 'svelte'

import { cn } from '@/shared/lib/utils'

let { class: className, children }: { class?: string; children?: Snippet } = $props()
</script>

<MenubarPrimitive.Root
  data-slot="menubar"
  class={cn('bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs', className)}
>
  {@render children?.()}
</MenubarPrimitive.Root>
