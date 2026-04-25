import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { loadConfig } from './api/client';
import { eventsService } from './api/events';
import { useAuthStore } from './stores/auth';

import AppLayout from './components/layout/AppLayout';
import ProjectLayout from './components/layout/ProjectLayout';
import RequireAuth from './components/auth/RequireAuth';
import Loader from './components/common/Loader';

import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import HomePage from './pages/HomePage';
import ProjectsListPage from './pages/ProjectsListPage';
import ProjectRouterPage from './pages/ProjectRouterPage';
import ProjectTimelinePage from './pages/ProjectTimelinePage';
import DetailRouterPage from './pages/DetailRouterPage';
import BacklogPage from './pages/BacklogPage';
import KanbanPage from './pages/KanbanPage';
import TaskboardPage from './pages/TaskboardPage';
import UserStoryDetailPage from './pages/UserStoryDetailPage';
import TaskDetailPage from './pages/TaskDetailPage';
import IssueDetailPage from './pages/IssueDetailPage';
import IssuesListPage from './pages/IssuesListPage';
import EpicsDashboardPage from './pages/EpicsDashboardPage';
import EpicDetailPage from './pages/EpicDetailPage';
import WikiPageView from './pages/WikiPage';
import WikiListPage from './pages/WikiListPage';
import TeamPage from './pages/TeamPage';
import SearchPage from './pages/SearchPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import UserSettingsPage from './pages/UserSettingsPage';
import DiscoverPage from './pages/DiscoverPage';
import NotFoundPage from './pages/NotFoundPage';

import './styles/main.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes (no header) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/change-password/:token" element={<ChangePasswordPage />} />

      {/* Main layout with header */}
      <Route element={<AppLayout />}>
        {/* Home */}
        <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />

        {/* Discover */}
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/discover/search" element={<DiscoverPage />} />

        {/* Projects */}
        <Route path="/projects/" element={<RequireAuth><ProjectsListPage /></RequireAuth>} />
        <Route path="/project/new" element={<RequireAuth><div className="page"><h1>Create Project</h1><p>Project creation form</p></div></RequireAuth>} />
        <Route path="/project/new/scrum" element={<RequireAuth><div className="page"><h1>Create Scrum Project</h1></div></RequireAuth>} />
        <Route path="/project/new/kanban" element={<RequireAuth><div className="page"><h1>Create Kanban Project</h1></div></RequireAuth>} />

        {/* Profile / Notifications / Settings */}
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/profile/:slug" element={<ProfilePage />} />
        <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
        <Route path="/user-settings/*" element={<RequireAuth><UserSettingsPage /></RequireAuth>} />

        {/* Project routes */}
        <Route path="/project/:pslug/" element={<ProjectRouterPage />} />
        <Route path="/project/:pslug" element={<ProjectLayout />}>
          <Route path="timeline" element={<ProjectTimelinePage />} />
          <Route path="t/:ref" element={<DetailRouterPage />} />
          <Route path="backlog" element={<BacklogPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="taskboard/:sslug" element={<TaskboardPage />} />
          <Route path="us/:usref" element={<UserStoryDetailPage />} />
          <Route path="task/:taskref" element={<TaskDetailPage />} />
          <Route path="issue/:issueref" element={<IssueDetailPage />} />
          <Route path="issues" element={<IssuesListPage />} />
          <Route path="epics" element={<EpicsDashboardPage />} />
          <Route path="epic/:epicref" element={<EpicDetailPage />} />
          <Route path="wiki" element={<Navigate to="home" replace />} />
          <Route path="wiki/:slug" element={<WikiPageView />} />
          <Route path="wiki-list" element={<WikiListPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="admin/*" element={<AdminPage />} />
        </Route>

        {/* Error pages */}
        <Route path="/error" element={<div className="error-page"><h1>Error</h1><p>An unexpected error occurred.</p></div>} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="/permission-denied" element={<div className="error-page"><h1>Permission denied</h1><p>You don't have permission to access this page.</p></div>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  const [configLoaded, setConfigLoaded] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    loadConfig().then(() => {
      setConfigLoaded(true);
      eventsService.initialize();
      if (isAuthenticated()) {
        eventsService.setupConnection();
      }
    });
  }, [isAuthenticated]);

  if (!configLoaded) return <Loader />;

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
