import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../redux/slices/uiSlice';
import { useAuth } from '../hooks/useAuth';

import {
  LayoutDashboard, BookOpen, Users, UserCheck, GraduationCap,
  ClipboardCheck, FileText, CalendarCheck, BarChart3,
  Settings, Bell, Award, Briefcase, Layers, Building2,
  ChevronLeft, ChevronRight, Menu, LogOut, Sparkles,
  BookMarked, BrainCircuit, Zap, StickyNote, HelpCircle,
} from 'lucide-react';
import { cn } from '../utils/cn';

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/students', icon: GraduationCap, label: 'Students' },
  { to: '/admin/mentors', icon: UserCheck, label: 'Mentors' },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/batches', icon: Layers, label: 'Batches' },
  { to: '/admin/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/admin/assignments', icon: ClipboardCheck, label: 'Assignments' },
  { to: '/admin/quizzes', icon: BrainCircuit, label: 'Quizzes' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/institutes', icon: Building2, label: 'Institutes' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
  { to: '/ai/quiz-generator', icon: Zap, label: 'AI Quiz Generator' },
  { to: '/ai/assignment-eval', icon: ClipboardCheck, label: 'AI Evaluation' },
  { to: '/ai/ask-doubt', icon: HelpCircle, label: 'Ask AI Doubt' },
];

const mentorLinks = [
  { to: '/mentor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/mentor/courses', icon: BookOpen, label: 'My Courses' },
  { to: '/mentor/assignments', icon: ClipboardCheck, label: 'Assignments' },
  { to: '/mentor/quizzes', icon: BrainCircuit, label: 'Quizzes' },
  { to: '/mentor/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/mentor/students', icon: GraduationCap, label: 'Students' },
  { to: '/mentor/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/mentor/notifications', icon: Bell, label: 'Notifications' },
  { to: '/mentor/settings', icon: Settings, label: 'Settings' },
  { to: '/ai/quiz-generator', icon: Zap, label: 'AI Quiz Generator' },
  { to: '/ai/assignment-eval', icon: ClipboardCheck, label: 'AI Evaluation' },
  { to: '/ai/ask-doubt', icon: HelpCircle, label: 'Ask AI Doubt' },
];

const studentLinks = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/courses', icon: BookOpen, label: 'My Courses' },
  { to: '/student/assignments', icon: ClipboardCheck, label: 'Assignments' },
  { to: '/student/quizzes', icon: BrainCircuit, label: 'Quizzes' },
  { to: '/student/progress', icon: BarChart3, label: 'My Progress' },
  { to: '/student/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/student/notifications', icon: Bell, label: 'Notifications' },
  { to: '/student/settings', icon: Settings, label: 'Settings' },
  { to: '/ai/adaptive-quiz', icon: BrainCircuit, label: 'Adaptive Quiz' },
  { to: '/ai/weak-topics', icon: BarChart3, label: 'Weak Topics' },
  { to: '/ai/ask-doubt', icon: HelpCircle, label: 'Ask AI Doubt' },
];

const linkMap = { super_admin: adminLinks, admin: adminLinks, mentor: mentorLinks, student: studentLinks };

export const Sidebar = () => {
  const { sidebarOpen } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, logout } = useAuth();
  const links = linkMap[user?.role] || studentLinks;

  return (
    <>
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-white dark:bg-slate-800 shadow-lg lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(toggleSidebar())}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ width: sidebarOpen ? 280 : 0 }}
        animate={{ width: sidebarOpen ? 280 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 overflow-hidden shadow-2xl',
          'lg:relative lg:z-auto'
        )}
      >
        <div className="flex flex-col h-full min-w-[280px]">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl gradient-primary">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">Futura Labs</h1>
                <p className="text-xs text-slate-500">Ai Tutor LMS</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hidden lg:block"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn('sidebar-link', isActive && 'active')
                }
              >
                <link.icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3 px-4">
              <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ') || ''}</p>
              </div>
            </div>
            <button onClick={logout} className="sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};
