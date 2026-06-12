import { createContext, type JSX, useContext } from 'solid-js'

import type { ToggleVariants } from './toggleVariants'

export type ToggleGroupContext = {
  variant?: ToggleVariants['variant']
  size?: ToggleVariants['size']
}

const ToggleGroupContextObj = createContext<ToggleGroupContext>()

export function ToggleGroupProvider(props: ToggleGroupContext & { children?: JSX.Element }) {
  return (
    <ToggleGroupContextObj.Provider value={{ variant: props.variant, size: props.size }}>
      {props.children}
    </ToggleGroupContextObj.Provider>
  )
}

export function useToggleGroupContext(): ToggleGroupContext {
  return useContext(ToggleGroupContextObj) ?? {}
}
