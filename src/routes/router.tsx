import { createBrowserRouter, Navigate } from "react-router-dom";

// Top-level pages
import HomePage from "@/pages/home/Home";

// Project layout + nested pages
import ProjectLayout from "@/pages/project/Layout";
import NewProjectPage from "@/pages/project/new/page";
import DashboardPage from "@/pages/project/dashboards/page";
import TranslatePage from "@/pages/project/editor/page";
import ProfilesPage from "@/pages/project/profiles/page";
import GlossaryPage from "@/pages/project/glossary/page";
import AIAgentPage from "@/pages/project/ai/page";
import SettingsPage from "@/pages/project/settings/page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/project/new",
    element: <NewProjectPage />,
  },

  // TODO : 추후 project router로 뺴기
  {
    path: "/project/:id",
    element: <ProjectLayout />,
    children: [
      { index: true, element: <Navigate to="translate" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "translate", element: <TranslatePage /> },
      { path: "profiles", element: <ProfilesPage /> },
      { path: "glossary", element: <GlossaryPage /> },
      { path: "ai-agent", element: <AIAgentPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);

export default router;
