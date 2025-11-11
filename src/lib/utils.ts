import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// 🧩 دالة cn: كتدمج الكلاسات بطريقة ذكية (Tailwind + شرطية)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
