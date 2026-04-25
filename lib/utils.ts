import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertToBengaliNumber = (num: number | string, language: 'en' | 'bn'): string => {
  const str = num.toString();
  if (language === 'en') return str;
  const englishDigits = '0123456789'.split('');
  const bengaliDigits = '০১২৩৪৫৬৭৮৯'.split('');
  return str.split('').map(digit => {
    const index = englishDigits.indexOf(digit);
    return index !== -1 ? bengaliDigits[index] : digit;
  }).join('');
};
