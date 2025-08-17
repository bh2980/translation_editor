import { createBrowserRouter, Navigate } from 'react-router-dom'

// Top-level pages
import HomePage from '@/pages/Home'
import NewProjectPage from '@/features/project/new-project/ui/NewProject'

// Project layout + nested pages
import ProjectLayout from '@/layouts/ProjectLayout'
import DashboardPage from '@/features/project/dashboard/ui/Dashboard'
import TranslatePage from '@/features/project/translate/ui/Translate'
import ProfilesPage from '@/features/project/profiles/ui/Profiles'
import GlossaryPage from '@/features/project/glossary/ui/Glossary'
import AIAgentPage from '@/pages/project/AIAgent'
import SettingsPage from '@/pages/project/Settings'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/project/new',
    element: <NewProjectPage />,
  },
  {
    path: '/project/:id',
    element: <ProjectLayout />,
    children: [
      { index: true, element: <Navigate to="translate" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'translate', element: <TranslatePage /> },
      { path: 'profiles', element: <ProfilesPage /> },
      { path: 'glossary', element: <GlossaryPage /> },
      { path: 'ai-agent', element: <AIAgentPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])

export default router
