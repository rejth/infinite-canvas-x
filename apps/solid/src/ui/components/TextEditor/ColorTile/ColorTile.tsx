import { For } from 'solid-js'

import { COLOR_LIST, Colors } from '@/shared/constants'

import styles from './ColorTile.module.css'

type ColorTileProps = {
  onChange: (color: Colors) => void
}

export function ColorTile(props: ColorTileProps) {
  function handleColorChange(value: string) {
    props.onChange(value as Colors)
  }

  return (
    <div class={`${styles.colors} ${styles.iconGroup}`}>
      <For each={COLOR_LIST}>
        {(color) => (
          <span
            role="button"
            tabindex="0"
            class={`${styles.icon} ${styles.color}`}
            style={`background-color: ${color.value}`}
            aria-label={`Select color ${color.value}`}
            onClick={() => handleColorChange(color.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleColorChange(color.value)
              }
            }}
          />
        )}
      </For>
      <span
        role="button"
        tabindex="0"
        class={`${styles.icon} ${styles.color} ${styles.transparent}`}
        aria-label="Select transparent color"
        onClick={() => handleColorChange('transparent')}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleColorChange('transparent')
          }
        }}
      />
    </div>
  )
}
