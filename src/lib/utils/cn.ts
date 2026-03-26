import { type ClassValue, clsx } from 'clsx';

// Утилита для объединения классов (аналог cn() из shadcn/ui)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
