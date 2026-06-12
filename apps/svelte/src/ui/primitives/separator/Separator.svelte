<script lang="ts">
import { Separator } from 'bits-ui'

import { cn } from '@/shared/lib/utils'

let {
  orientation = 'horizontal',
  class: className,
}: {
  orientation?: 'horizontal' | 'vertical'
  class?: string
} = $props()
</script>

<Separator.Root
  data-slot="separator-root"
  {orientation}
  class={cn(
    'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
    className,
  )}
/>
