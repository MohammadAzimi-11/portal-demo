import React, { useState, useRef, useEffect } from "react";
import {
  Sun,
  Moon,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
} from 'lucide-react'
import { cn } from '../../../utils/utils'
import { timeAgo } from '../../../utils/utils'
import { useNavigate } from 'react-router'


// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_USER = {
  name: "Ahmed Al-Rashid",
  role: "Tenant Admin",
  email: "ahmed@academy.com",
  image: null, // set to a URL string to use an avatar image
};

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "New exam scheduled",
    body: "Business English — Cycle 12 exam on 28 Apr",
    type: "exam",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 14),
  },
  {
    id: 2,
    title: "Attendance alert",
    body: "Student Sara K. dropped below 75% attendance",
    type: "session",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 3,
    title: "Certificate issued",
    body: "Cycle 11 — 24 certificates generated successfully",
    type: "announcement",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26),
  },
];

const NOTIFICATION_TYPE_COLOR = {
  exam: "bg-primary-100 text-primary-600",
  session: "bg-accent-100 text-accent-700",
  announcement: "bg-secondary-100 text-secondary-700",
  payment: "bg-red-100 text-red-600",
  general: "bg-muted text-muted-foreground",
};

// ── Subcomponent: Notification Dropdown ──────────────────────────────────────
function NotificationDropdown({ isDark }) {
  const [items, setItems] = useState(MOCK_NOTIFICATIONS);
  const unread = items.filter((n) => !n.is_read).length;

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));

  return (
    <div
      className={cn(
        "absolute right-[-3.25rem] top-full mt-2 w-[calc(100vw-1.5rem)] max-w-80 rounded-lg border overflow-hidden z-[110] animate-slide-in-up sm:right-0 sm:w-80",
        isDark ? "bg-gray-900 border-gray-700" : "bg-white border-border",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b",
          isDark ? "border-gray-800" : "border-border",
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-semibold",
              isDark ? "text-white" : "text-foreground",
            )}
          >
            Notifications
          </span>
          {unread > 0 && (
            <span className="badge badge-blue text-[10px] px-1.5">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-medium transition-colors text-primary hover:text-primary-700"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Items */}
      <div className="overflow-y-auto divide-y divide-border max-h-72 scroll-area">
        {items.length === 0 ? (
          <p className="py-8 text-sm text-center text-muted-foreground">
            You're all caught up
          </p>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              className={cn(
                "flex gap-3 px-4 py-3 cursor-pointer transition-colors duration-150",
                !n.is_read
                  ? isDark
                    ? "bg-primary/10 hover:bg-primary/15"
                    : "bg-primary-50 hover:bg-primary-100"
                  : isDark
                    ? "hover:bg-gray-800"
                    : "hover:bg-muted",
              )}
              onClick={() =>
                setItems((prev) =>
                  prev.map((x) =>
                    x.id === n.id ? { ...x, is_read: true } : x,
                  ),
                )
              }
            >
              {/* Type dot */}
              <div className="mt-0.5 shrink-0">
                <span
                  className={cn(
                    "inline-flex w-2 h-2 rounded-full mt-1.5",
                    !n.is_read
                      ? "bg-primary"
                      : isDark
                        ? "bg-gray-600"
                        : "bg-gray-300",
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-xs font-semibold truncate",
                    isDark ? "text-gray-100" : "text-foreground",
                  )}
                >
                  {n.title}
                </p>
                <p
                  className={cn(
                    "text-xs mt-0.5 truncate",
                    isDark ? "text-gray-400" : "text-muted-foreground",
                  )}
                >
                  {n.body}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {timeAgo(n.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        className={cn(
          "px-4 py-2.5 border-t text-center",
          isDark ? "border-gray-800" : "border-border",
        )}
      >
        <button className="text-xs font-medium transition-colors text-primary hover:text-primary-700">
          View all notifications
        </button>
      </div>
    </div>
  );
}

// ── Subcomponent: User Profile Dropdown ──────────────────────────────────────
function UserDropdown({ user, isDark, onClose }) {
  const navigate = useNavigate()
  const menuItems = [
  { label: 'My Profile', icon: User, action: () => { navigate('/profile'); onClose() } },
  { label: 'Settings',   icon: Settings, action: () => {} },
]

  return (
    <div
      className={cn(
        "absolute right-0 top-full mt-2 w-56 rounded-lg border overflow-hidden z-[110] animate-slide-in-up",
        "w-[calc(100vw-1.5rem)] max-w-56 sm:w-56",
        isDark ? "bg-gray-900 border-gray-700" : "bg-white border-border",
      )}
    >
      {/* User info header */}
      <div
        className={cn(
          "px-4 py-3 border-b",
          isDark ? "border-gray-800" : "border-border",
        )}
      >
        <p
          className={cn(
            "text-sm font-semibold truncate",
            isDark ? "text-white" : "text-foreground",
          )}
        >
          {user.name}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {user.email}
        </p>
        <span className="badge badge-blue text-[10px] px-2 py-0.5 mt-1.5">
          {user.role}
        </span>
      </div>

      {/* Menu items */}
      <div className="py-1">
        {menuItems.map(({ label, icon: Icon, action }) => (
          <button
            key={label}
            onClick={() => {
              action();
              onClose();
            }}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium transition-colors duration-150",
              isDark
                ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                : "text-gray-700 hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon size={15} strokeWidth={2} />
            {label}
          </button>
        ))}
      </div>

      {/* Divider + logout */}
      <div
        className={cn(
          "border-t py-1",
          isDark ? "border-gray-800" : "border-border",
        )}
      >
        <button
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium transition-colors duration-150",
            "text-destructive hover:bg-red-50 dark:hover:bg-red-950/30",
          )}
        >
          <LogOut size={15} strokeWidth={2} />
          Log out
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
/**
 * LayoutHeader
 *
 * Props:
 *   collapsed     {boolean}    sidebar collapsed state
 *   onToggle      {function}   toggle sidebar collapse
 *   isDark        {boolean}    from useThemeStore
 *   toggleTheme   {function}   from useThemeStore
 */
export default function LayoutHeader({
  collapsed,
  onToggle,
  onMobileMenu,
  isDark,
  toggleTheme,
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const iconBtn = cn(
    "relative flex items-center justify-center w-9 h-9 rounded-md transition-all duration-200",
    isDark
      ? "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
      : "text-gray-500 hover:bg-muted hover:text-foreground",
  );

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-[100] h-16 flex items-center px-3 gap-2 border-b transition-all duration-300 sm:px-4 sm:gap-3",
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-border",
        collapsed ? "lg:left-16" : "lg:left-[240px]",
      )}
    >
      {/* ── Sidebar collapse toggle ─────────────────────────────────────── */}
      <button
        onClick={onToggle}
        className={cn(iconBtn, "hidden lg:flex")}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <PanelLeftOpen size={18} strokeWidth={2} />
        ) : (
          <PanelLeftClose size={18} strokeWidth={2} />
        )}
      </button>

      <button
        onClick={onMobileMenu}
        className={cn(iconBtn, "lg:hidden")}
        aria-label="Open navigation"
      >
        <Menu size={18} strokeWidth={2} />
      </button>

      {/* ── Spacer ──────────────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Dark mode toggle ────────────────────────────────────────────── */}
      <button
        onClick={toggleTheme}
        className={cn(iconBtn, "transition-transform hover:scale-110")}
        aria-label="Toggle dark mode"
      >
        {isDark ? (
          <Sun size={18} strokeWidth={2} className="text-accent" />
        ) : (
          <Moon size={18} strokeWidth={2} />
        )}
      </button>

      {/* ── Notifications ───────────────────────────────────────────────── */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => {
            setNotifOpen((v) => !v);
            setProfileOpen(false);
          }}
          className={cn(
            iconBtn,
            notifOpen &&
              (isDark ? "bg-gray-800 text-white" : "bg-muted text-foreground"),
          )}
          aria-label="Notifications"
        >
          <Bell size={18} strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border-2 border-white dark:border-gray-900" />
          )}
        </button>

        {notifOpen && (
          <NotificationDropdown
            isDark={isDark}
          />
        )}
      </div>

      {/* ── User profile ────────────────────────────────────────────────── */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => {
            setProfileOpen((v) => !v);
            setNotifOpen(false);
          }}
          className={cn(
            "flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-md transition-all duration-200 cursor-pointer sm:gap-2.5 sm:pl-2 sm:pr-3",
            isDark ? "hover:bg-gray-800" : "hover:bg-muted",
            profileOpen && (isDark ? "bg-gray-800" : "bg-muted"),
          )}
          aria-label="User profile"
        >
          {/* Avatar */}
          {MOCK_USER.image ? (
            <img
              src={MOCK_USER.image}
              alt={MOCK_USER.name}
              className="object-cover rounded-md w-7 h-7"
            />
          ) : (
            <div className="flex items-center justify-center rounded-md w-7 h-7 bg-primary shrink-0">
              <span className="text-xs font-bold leading-none text-white">
                {MOCK_USER.name
                  .split(" ")
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join("")}
              </span>
            </div>
          )}

          {/* Name + role — hidden on small screens */}
          <div className="hidden text-left sm:block">
            <p
              className={cn(
                "text-xs font-semibold leading-none truncate max-w-[120px]",
                isDark ? "text-white" : "text-foreground",
              )}
            >
              {MOCK_USER.name.split(" ")[0]}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
              {MOCK_USER.role}
            </p>
          </div>

          <ChevronDown
            size={14}
            strokeWidth={2.5}
            className={cn(
              "text-muted-foreground transition-transform duration-200",
              profileOpen && "rotate-180",
            )}
          />
        </button>

        {profileOpen && (
          <UserDropdown
            user={MOCK_USER}
            isDark={isDark}
            onClose={() => setProfileOpen(false)}
          />
        )}
      </div>
    </header>
  );
}
