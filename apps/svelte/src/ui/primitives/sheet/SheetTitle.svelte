<script lang="ts">
import { Dialog } from 'bits-ui'
import type { Snippet } from 'svelte'

import { cn } from '@/shared/lib/utils'

let { class: className, children }: { class?: string; children?: Snippet } = $props()
</script>

<Dialog.Title data-slot="sheet-title" class={cn('text-foreground font-semibold', className)}>
  {@render children?.()}
</Dialog.Title>
