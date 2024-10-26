import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import stc from "string-to-color";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const stringToColor = (str: string) => {
  return stc(str);
};

export const getFilename = (str: string) => {
  return str.split("/").at(-1)?.split("?")[0]!;
};
