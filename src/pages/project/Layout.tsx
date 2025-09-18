import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";

import { SidebarProvider, SidebarInset } from "@/shared/ui/sidebar";
import { ProjectSidebar } from "@/widgets/project";

export default function ProjectLayout({ children }: { children?: ReactNode }) {
  return (
    <SidebarProvider>
      <ProjectSidebar />
      <SidebarInset className="max-h-screen min-w-0 p-4 md:p-8 flex-1 flex flex-col min-h-0">
        {children ?? <Outlet />}
      </SidebarInset>
    </SidebarProvider>
  );
}
