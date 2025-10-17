import { cn } from '@/app/shared/lib/utils';

import style from './Icon.module.css';

interface Sizes {
  [name: string]: number | string;
}

const SIZE_RESPONSIVE = 'responsive';
const SIZE_EXTRA_SMALL = 'xsmall';
const SIZE_SMALL = 'small';
const SIZE_MEDIUM = 'medium';
const SIZE_LARGE = 'large';

const SIZES: Sizes = {
  [SIZE_EXTRA_SMALL]: 13,
  [SIZE_SMALL]: 17,
  [SIZE_MEDIUM]: 22,
  [SIZE_LARGE]: 34,
  [SIZE_RESPONSIVE]: '100%',
};

type Props = {
  name?: string;
  size?: 'responsive' | 'xsmall' | 'small' | 'medium' | 'large';
  color?: CSSModuleClasses[string];
};

export const Icon = ({ name = '', size = SIZE_RESPONSIVE, color = '' }: Props) => {
  const sizeValue = SIZES[size] || size;

  return (
    <svg width={sizeValue} height={sizeValue} className={cn(style.container, color)}>
      <use xlinkHref={`#${name}`} href={`#${name}`} />
    </svg>
  );
};
