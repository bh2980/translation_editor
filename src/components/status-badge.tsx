"use client"

export function statusColorToClass(color: string) {
  // map hex or token to tailwind color
  // using a limited palette to keep contrast
  switch (color) {
    case "slate":
      return "bg-slate-500"
    case "amber":
      return "bg-amber-500"
    case "emerald":
      return "bg-emerald-500"
    case "violet":
      return "bg-violet-500"
    default:
      return "bg-slate-500"
  }
}
