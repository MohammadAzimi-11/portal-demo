import { createPortal } from 'react-dom'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { NavLink, useLocation } from 'react-router'
import { ChevronDown } from 'lucide-react'
import { navConfig } from './navconfig'
import { cn } from '../../../utils/utils'

// ─────────────────────────────────────────────────────────────────────────────
// NavItem — single link row (shared between full sidebar and flyout)
// ─────────────────────────────────────────────────────────────────────────────
function NavItem({ item, collapsed, isDark, inFlyout = false, onNavigate }) {
  const location = useLocation()
  const Icon = item.icon
  const isActive =
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path)

  return (
    <NavLink
      to={item.path}
      title={collapsed && !inFlyout ? item.label : undefined}
      onClick={onNavigate}
      className={cn(
        'group flex items-start gap-3 rounded-md cursor-pointer select-none text-left',
        'transition-all duration-200 relative',
        // Layout
        inFlyout
          ? 'w-full justify-start px-3 py-2'
          : collapsed
          ? 'justify-center px-0 py-2.5 mx-1'
          : 'w-full justify-start px-3 py-2.5',
        // Active
        isActive
          ? cn(
              'font-semibold',
              isDark ? 'bg-primary/20 text-primary-300' : 'bg-primary-50 text-primary-600',
              !collapsed && !inFlyout && 'border-l-4 border-primary pl-[calc(0.75rem-4px)]'
            )
          : cn(
              'font-medium',
              isDark
                ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                : 'text-gray-600 hover:bg-muted hover:text-foreground'
            )
      )}
    >
      {/* Rail active bar */}
      {isActive && collapsed && !inFlyout && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
      )}

      <Icon
        size={inFlyout ? 16 : 18}
        strokeWidth={isActive ? 2.5 : 2}
        className={cn(
          'shrink-0 transition-transform duration-200 group-hover:scale-110',
          isActive ? (isDark ? 'text-primary-300' : 'text-primary-600') : ''
        )}
      />

      {(!collapsed || inFlyout) && (
        <span className={cn('truncate flex-1 text-left', inFlyout ? 'text-xs' : 'text-sm')}>
          {item.label}
        </span>
      )}

      {item.badge && (!collapsed || inFlyout) && (
        <span className="badge badge-blue text-[10px] px-1.5 py-0 min-w-[18px] text-center">
          {item.badge}
        </span>
      )}
    </NavLink>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FlyoutPopover — appears on hover over a group in collapsed rail mode
// ─────────────────────────────────────────────────────────────────────────────
function FlyoutPopover({ section, isDark, top, onMouseEnter, onMouseLeave, onNavigate }) {
  const menu = (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ 
        position: 'fixed',
        top: `${top}px`, 
        left: '64px',
        zIndex: 99999
      }}
      className={cn(
        'w-48 rounded-lg border shadow-xl overflow-hidden animate-slide-in-left',
        isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-border'
      )}
    >
      {section.group && (
        <div className={cn('px-3 py-2 border-b', isDark ? 'border-gray-800' : 'border-border')}>
          <p className={cn('text-[10px] font-bold uppercase tracking-wider', isDark ? 'text-gray-500' : 'text-muted-foreground')}>
            {section.group}
          </p>
        </div>
      )}
      <div className="py-1 px-1.5">
        {section.items.map((item) => (
          <NavItem key={item.path} item={item} collapsed={false} isDark={isDark} inFlyout onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );

  return createPortal(menu, document.body);
}

// ─────────────────────────────────────────────────────────────────────────────
// CollapsibleGroup — accordion group in full sidebar mode
// ─────────────────────────────────────────────────────────────────────────────
function CollapsibleGroup({ section, isDark, onNavigate }) {
  const location = useLocation()

  const hasActive = section.items.some((item) =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path)
  )

  // Start closed; auto-open if a child route is active
  const [open, setOpen] = useState(hasActive)

  // Re-open when navigating into this group from outside
  useEffect(() => {
    if (hasActive) setOpen(true)
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {/* Clickable group header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center justify-start gap-2 px-3 py-1.5 rounded-md mt-3 mb-0.5 text-left',
          'transition-colors duration-150 cursor-pointer select-none group'
        )}
      >
        <span
          className={cn(
            'flex-1 text-left text-label transition-colors duration-150',
            hasActive
              ? isDark ? 'text-primary-400' : 'text-primary-600'
              : isDark ? 'text-gray-500 group-hover:text-gray-300' : 'text-muted-foreground group-hover:text-gray-500'
          )}
        >
          {section.group}
        </span>

        <ChevronDown
          size={13}
          strokeWidth={2.5}
          className={cn(
            'shrink-0 transition-transform duration-200',
            open ? 'rotate-0' : '-rotate-90',
            hasActive
              ? isDark ? 'text-primary-400' : 'text-primary-500'
              : isDark ? 'text-gray-600 group-hover:text-gray-400' : 'text-gray-400 group-hover:text-gray-500'
          )}
        />
      </button>

      {/* Items — CSS height animation */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="space-y-0.5 pb-1">
          {section.items.map((item) => (
            <NavItem key={item.path} item={item} collapsed={false} isDark={isDark} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// RailGroup — icon cluster for a group in collapsed rail (with hover flyout)
// ─────────────────────────────────────────────────────────────────────────────
function RailGroup({ section, isDark, isFirst, onNavigate }) {
  const [flyoutOpen, setFlyoutOpen] = useState(false)
  const [flyoutTop, setFlyoutTop]   = useState(0)
  const groupRef     = useRef(null)
  const closeTimeout = useRef(null)

  const openFlyout = useCallback(() => {
    clearTimeout(closeTimeout.current)
    if (groupRef.current) {
      const rect = groupRef.current.getBoundingClientRect()
      setFlyoutTop(rect.top)
    }
    setFlyoutOpen(true)
  }, [])

  const closeFlyout = useCallback(() => {
    closeTimeout.current = setTimeout(() => setFlyoutOpen(false), 100)
  }, [])

  useEffect(() => () => clearTimeout(closeTimeout.current), [])

  return (
    <div className="relative" ref={groupRef}>
      {/* Divider between groups */}
      {!isFirst && (
        <div
          className={cn('mx-3 my-2 h-px', isDark ? 'bg-gray-800' : 'bg-border')}
        />
      )}

      {/* Icon items trigger flyout on hover */}
      <div
        onMouseEnter={openFlyout}
        onMouseLeave={closeFlyout}
        className="space-y-0.5"
      >
        {section.items.map((item) => (
          <NavItem key={item.path} item={item} collapsed isDark={isDark} onNavigate={onNavigate} />
        ))}
      </div>

      {flyoutOpen && (
        <FlyoutPopover
          section={section}
          isDark={isDark}
          top={flyoutTop}
          onMouseEnter={() => clearTimeout(closeTimeout.current)}
          onMouseLeave={closeFlyout}
          onNavigate={onNavigate}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LayoutSidebar — main export
// ─────────────────────────────────────────────────────────────────────────────
export default function LayoutSidebar({ collapsed, isDark, mobileOpen = false, onClose, onNavigate }) {
  const ungrouped = navConfig.filter((s) => s.group === null)
  const grouped   = navConfig.filter((s) => s.group !== null)
  const compact = collapsed && !mobileOpen

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-[90] bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-screen z-[110] flex flex-col transition-all duration-300',
          'w-[240px] border-r lg:translate-x-0',
          isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-border',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'lg:w-16' : 'lg:w-[240px]'
        )}
      >
      {/* ── Logo / Brand ──────────────────────────────────────────────────── */}
      <div
        className={cn(
          'flex items-center h-16 px-4 border-b shrink-0',
          isDark ? 'border-gray-800' : 'border-border'
        )}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
          <span className="text-white font-extrabold text-sm leading-none">P</span>
        </div>

        <div
          className={cn(
            'ml-3 overflow-hidden transition-all duration-300',
            compact ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}
        >
          <p
            className={cn(
              'font-bold text-sm leading-none tracking-tight whitespace-nowrap',
              isDark ? 'text-white' : 'text-foreground'
            )}
          >
            Portal
          </p>
          <p className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase mt-0.5 whitespace-nowrap">
            Management
          </p>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto scroll-area py-3 px-2">

        {/* Ungrouped items (e.g. Dashboard) — always flat, never collapsible */}
        {ungrouped.map((section) =>
          section.items.map((item) => (
            <NavItem key={item.path} item={item} collapsed={compact} isDark={isDark} onNavigate={onNavigate} />
          ))
        )}

        {/* Grouped sections */}
        {compact
          ? grouped.map((section, i) => (
              <RailGroup
                key={section.group}
                section={section}
                isDark={isDark}
                isFirst={i === 0}
                onNavigate={onNavigate}
              />
            ))
          : grouped.map((section) => (
              <CollapsibleGroup
                key={section.group}
                section={section}
                isDark={isDark}
                onNavigate={onNavigate}
              />
            ))
        }
      </nav>

      {/* ── Bottom slot ───────────────────────────────────────────────────── */}
      <div
        className={cn(
          'shrink-0 border-t p-3',
          isDark ? 'border-gray-800' : 'border-border'
        )}
      />
      </aside>
    </>
  )
}
