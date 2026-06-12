<script lang="ts">
import { cn } from '@/shared/lib/utils'

let { name, color }: { name: string; color?: string } = $props()
</script>

<svg width="100%" height="100%" class={cn('block', color)}>
  <use href={`#${name}`} />
</svg>
