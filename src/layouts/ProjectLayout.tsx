import type { ReactNode } from "react"
import { Link, Outlet, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Settings, BookText, Table2, User, Bot, BarChart3 } from "lucide-react"

export default function ProjectLayout({ children }: { children?: ReactNode }) {
  const { id } = useParams<{ id: string }>()
  const nav = [
    { href: `/project/${id}/dashboard`, label: "대시보드", icon: BarChart3 },
    { href: `/project/${id}/translate`, label: "번역", icon: Table2 },
    { href: `/project/${id}/profiles`, label: "프로필", icon: User },
    { href: `/project/${id}/glossary`, label: "용어집", icon: BookText },
    { href: `/project/${id}/ai-agent`, label: "AI Agent", icon: Bot },
    { href: `/project/${id}/settings`, label: "설정", icon: Settings },
  ]

  return (
    <div className="grid min-h-[100dvh] grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="border-r p-4">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start text-lg font-semibold">
              프로젝트 홈
            </Button>
          </Link>
        </div>
        <nav className="space-y-1">
          {nav.map((n) => (
            <Link key={n.href} to={n.href}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <n.icon size={16} />
                {n.label}
              </Button>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="p-4 md:p-8">{children ?? <Outlet />}</main>
    </div>
  )
}
