import { Link, useLocation, useParams } from "react-router-dom";
import {
  Settings,
  BookText,
  Table2,
  User,
  Bot,
  BarChart3,
  LogOut,
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  SidebarFooter,
  SidebarTrigger,
} from "@/shared/ui/sidebar";

import { Separator } from "@/shared/ui/separator";
import { db } from "@/shared/lib/db";

import { useLiveQuery } from "dexie-react-hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export const ProjectSidebar = () => {
  const { id } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const projects = useLiveQuery(() => db.projects.toArray());

  const nav = [
    { href: `/project/${id}/dashboard`, label: "대시보드", icon: BarChart3 },
    { href: `/project/${id}/translate`, label: "번역", icon: Table2 },
    { href: `/project/${id}/profiles`, label: "프로필", icon: User },
    { href: `/project/${id}/glossary`, label: "용어집", icon: BookText },
    { href: `/project/${id}/ai-agent`, label: "AI Agent", icon: Bot },
    { href: `/project/${id}/settings`, label: "설정", icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Select value={id}>
              <div className="flex gap-2">
                <SelectTrigger className="w-full border-none shadow-none group-data-[collapsible=icon]:hidden">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <Separator
                  orientation="vertical"
                  className="mx-2 !h-[32px] group-data-[collapsible=icon]:hidden"
                />
                <SidebarTrigger />
              </div>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* <DropdownMenu>
              <div className="flex gap-2">
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="group-data-[collapsible=icon]:hidden">
                    Select Project
                    <ChevronDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <Separator
                  orientation="vertical"
                  className="mx-2 !h-[32px] group-data-[collapsible=icon]:hidden"
                />
                <SidebarTrigger />
              </div>
              <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                {projects?.map((project) => (
                  <DropdownMenuItem key={project.id}>
                    <span>{project.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu> */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="!w-[93%] group-data-[collapsible=icon]:!w-[70%]" />
      <SidebarContent className="my-2">
        <SidebarMenu>
          {nav.map((n) => (
            <SidebarMenuItem key={n.href} className="px-2">
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(n.href)}
                tooltip={n.label}
              >
                <Link to={n.href}>
                  <n.icon />
                  <span className="group-data-[collapsible=icon]:sr-only group-data-[collapsible=icon]:hidden">
                    {n.label}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator className="!w-[93%] group-data-[collapsible=icon]:!w-[70%]" />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="나가기">
              <Link to="/">
                <LogOut />
                <span className="group-data-[collapsible=icon]:sr-only group-data-[collapsible=icon]:hidden">
                  나가기
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
