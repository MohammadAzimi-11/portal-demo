import {
  LayoutDashboard,
  BookOpen,
  RefreshCcw,
  CalendarDays,
  Award,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  FileText,
  Bell,
  Settings,
} from 'lucide-react'

/**
 * navConfig
 *
 * Each group has a label and an array of items.
 * Each item: { label, path, icon: LucideComponent, badge? }
 *
 * badge: number | string — renders a small counter on the nav item
 */
export const navConfig = [
  {
    group: null, // no group label — top-level
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Courses',
    items: [
      { label: 'Cycles',    path: '/cycles',   icon: RefreshCcw },
      { label: 'Classes',   path: '/classes',  icon: CalendarDays },
      { label: 'Subjects',  path: '/subjects', icon: BookOpen },
      { label: 'Overview',  path: '/overview', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Students',
    items: [
      { label: 'Students',    path: '/students',    icon: GraduationCap },
      { label: 'Certificates',path: '/certificates',icon: Award },
    ],
  },
  {
    group: 'HR',
    items: [
      { label: 'Employees',   path: '/employees',   icon: Briefcase },
    ],
  },
  {
    group: 'Content',
    items: [
      { label: 'Curriculum',  path: '/curriculum',  icon: FileText },
      { label: 'Resources',   path: '/resources',   icon: BookOpen },
      { label: 'Announcements',path:'/announcements',icon: Bell },
    ],
  },
  {
    group: 'System',
    items: [
      { label: 'Audit Log',   path: '/audit',       icon: ShieldCheck },
      { label: 'Settings',    path: '/settings',    icon: Settings },
    ],
  },
]
