import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function setByPath(object: Record<string, unknown>, path: string, value: unknown) {
  path.split('.').forEach((property, i, array) => {
    if (i === array.length - 1) {
      object[property] = value;
    } else {
      if (typeof object[property] !== 'object' || object[property] === null) {
        object[property] = {};
      }
      object = object[property] as Record<string, unknown>;
    }
  });
}
