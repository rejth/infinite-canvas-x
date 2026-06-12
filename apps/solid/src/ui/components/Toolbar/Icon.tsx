import { cn } from '@/shared/lib/utils'

type IconProps = {
  name: string
  color?: string
}

export function Icon(props: IconProps) {
  return (
    <svg width="100%" height="100%" class={cn('block', props.color)}>
      <use href={`#${props.name}`} />
    </svg>
  )
}
