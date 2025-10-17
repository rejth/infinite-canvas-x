import { COLOR_LIST, Colors } from '@/app/shared/constants';

import styles from './ColorTile.module.css';

type Props = {
  onChange: (color: Colors) => void;
};

export const ColorTile = ({ onChange }: Props) => {
  const handleColorChange = (value: string) => onChange(value as Colors);

  return (
    <div className={`${styles.colors} ${styles.iconGroup}`}>
      {COLOR_LIST.map(({ value }) => (
        <span
          key={value}
          tabIndex={0}
          role="button"
          className={`${styles.icon} ${styles.color}`}
          style={{ backgroundColor: value }}
          onClick={() => handleColorChange(value)}
        />
      ))}
      <span
        tabIndex={0}
        role="button"
        className={`${styles.icon} ${styles.color} ${styles.transparent}`}
        onClick={() => handleColorChange('transparent')}
      />
    </div>
  );
};
