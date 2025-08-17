import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const loadFile = (onLoad: (file: File) => void) => {
  if (!document) {
    return;
  }

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "*/*";
  fileInput.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];

    if (file) {
      onLoad(file);
    } else {
      throw new Error("파일이 선택되지 않았습니다.");
    }
  };

  fileInput.click();
};

export const downloadFile = (file: Blob | MediaSource, filename: string) => {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const isDev = () => process.env.NODE_ENV === "development" || import.meta.env.DEV;
