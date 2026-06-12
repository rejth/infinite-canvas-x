import { Select as SelectPrimitive } from '@kobalte/core/select'
import { type JSX, splitProps } from 'solid-js'

export type SelectProps = {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  options?: string[]
  children?: JSX.Element
}

export function Select(props: SelectProps) {
  const [local, rest] = splitProps(props, ['value', 'onChange', 'disabled', 'options', 'children'])

  return (
    <SelectPrimitive
      value={local.value}
      onChange={(value) => {
        if (value != null) {
          local.onChange?.(value)
        }
      }}
      disabled={local.disabled}
      options={local.options ?? []}
      {...rest}
    >
      {local.children}
    </SelectPrimitive>
  )
}
