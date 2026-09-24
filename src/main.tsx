import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import './index.css';
import { Toaster } from './components/ui';
import AdminLayout from './layouts/AdminLayout';
import WorkerLayout from './layouts/WorkerLayout';
import Landing from './pages/Landing';
import Join from './pages/Join';
import Dashboard from './pages/admin/Dashboard';
import Events from './pages/admin/Events';
import EventForm from './pages/admin/EventForm';
import EventTemplates from './pages/admin/EventTemplates';
import EventTemplateEditor from './pages/admin/EventTemplateEditor';
import EventDetail from './pages/admin/EventDetail';
import Crew from './pages/admin/Crew';
import Person from './pages/admin/Person';
import Training from './pages/admin/Training';
import CourseBuilder from './pages/admin/CourseBuilder';
import TemplateLibrary from './pages/admin/TemplateLibrary';
import Flows from './pages/admin/Flows';
import Paperwork from './pages/admin/Paperwork';
import Invite from './pages/admin/Invite';
import Contracts from './pages/admin/Contracts';
import CompanySettings from './pages/admin/CompanySettings';
import ContractEditor from './pages/admin/ContractEditor';
import ContractSign from './pages/worker/ContractSign';
import Home from './pages/worker/Home';
import Learn from './pages/worker/Learn';
import CoursePlayer from './pages/worker/CoursePlayer';
import DocSign from './pages/worker/DocSign';
import MyShifts from './pages/worker/MyShifts';
import Briefing from './pages/worker/Briefing';
import Profile from './pages/worker/Profile';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Toaster />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/join/:code" element={<Join />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="events" element={<Events />} />
          <Route path="events/new" element={<EventForm />} />
          <Route path="events/templates" element={<EventTemplates />} />
          <Route path="events/templates/:id" element={<EventTemplateEditor />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="events/:id/edit" element={<EventForm />} />
          <Route path="crew" element={<Crew />} />
          <Route path="crew/:id" element={<Person />} />
          <Route path="training" element={<Training />} />
          <Route path="training/library" element={<TemplateLibrary />} />
          <Route path="training/:id" element={<CourseBuilder />} />
          <Route path="flows" element={<Flows />} />
          <Route path="paperwork" element={<Paperwork />} />
          <Route path="invite" element={<Invite />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="contracts/:id" element={<ContractEditor />} />
          <Route path="settings" element={<CompanySettings />} />
        </Route>
        <Route path="/app" element={<WorkerLayout />}>
          <Route index element={<Home />} />
          <Route path="learn" element={<Learn />} />
          <Route path="learn/:id" element={<CoursePlayer />} />
          <Route path="docs/:id" element={<DocSign />} />
          <Route path="contracts/:id" element={<ContractSign />} />
          <Route path="events" element={<MyShifts />} />
          <Route path="events/:id" element={<Briefing />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
