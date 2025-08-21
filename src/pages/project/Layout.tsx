import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";

import { SidebarProvider, SidebarInset } from "@/shared/ui/sidebar";
import { ProjectSidebar } from "@/widgets/project";

export default function ProjectLayout({ children }: { children?: ReactNode }) {
  return (
    <SidebarProvider>
      <ProjectSidebar />
      <SidebarInset>
        <main className="p-4 md:p-8">{children ?? <Outlet />}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
