import { createBrowserRouter, Navigate } from "react-router-dom";

// Top-level pages
import HomePage from "@/pages/Home";

// Project layout + nested pages
import ProjectLayout from "@/layouts/ProjectLayout";
import DashboardPage from "@/features/project/ui/Dashboard";
import TranslatePage from "@/features/translate/ui/Translate";
import ProfilesPage from "@/features/profiles/ui/Profiles";
import GlossaryPage from "@/features/glossary/ui/Glossary";
import SettingsPage from "@/features/project/ui/Settings";
import AIAgentPage from "@/features/ai/ui/AIAgent";
import NewProjectPage from "@/features/project/ui/NewProject";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/project/setup",
    element: <NewProjectPage />,
  },
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
