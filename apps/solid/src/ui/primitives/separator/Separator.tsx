import { Separator as SeparatorPrimitive } from '@kobalte/core/separator'
import { splitProps } from 'solid-js'

import { cn } from '@/shared/lib/utils'

export type SeparatorProps = {
  orientation?: 'horizontal' | 'vertical'
  class?: string
}

export function Separator(props: SeparatorProps) {
  const [local] = splitProps(props, ['orientation', 'class'])

  return (
    <SeparatorPrimitive
      data-slot="separator-root"
      orientation={local.orientation ?? 'horizontal'}
      class={cn(
        'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        local.class,
      )}
    />
  )
}
