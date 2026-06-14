// ─────────────────────────────────────────────────────────────────────────────
// AnnouncementsPage.jsx
//
// Full announcement feed: card grid, type/target filtering, search, detail
// modal, empty states. Auto-refreshes on mount. Design follows CLAUDE.md flat
// system — zero shadows, color-block cards, Outfit font, snappy transitions.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState, useCallback } from 'react'
import {
  Bell,
  BookOpen,
  Award,
  GraduationCap,
  Briefcase,
  Users,
  X,
  Search,
  ChevronRight,
  CalendarDays,
  User,
  Tag,
  RefreshCw,
  Megaphone,
  ClipboardList,
  DollarSign,
  Info,
} from 'lucide-react'
import { cn, timeAgo, formatDate } from '../../utils/utils'
import { useThemeStore } from '../shared/store/useThemeStore'
import api from '../../utils/api'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps notification type → visual config
 * type comes from the Announcement's body keywords or a `type` field if you add one.
 * Here we infer from title prefix or target_type.
 */
const TYPE_CONFIG = {
  exam: {
    label:   'Exam',
    icon:    ClipboardList,
    bg:      'bg-blue-50',
    iconBg:  'bg-blue-500',
    badge:   'bg-blue-100 text-blue-700',
    accent:  'border-l-blue-500',
  },
  payment: {
    label:   'Payment',
    icon:    DollarSign,
    bg:      'bg-red-50',
    iconBg:  'bg-red-500',
    badge:   'bg-red-100 text-red-700',
    accent:  'border-l-red-500',
  },
  certificate: {
    label:   'Certificate',
    icon:    Award,
    bg:      'bg-amber-50',
    iconBg:  'bg-amber-500',
    badge:   'bg-amber-100 text-amber-700',
    accent:  'border-l-amber-500',
  },
  student: {
    label:   'Student',
    icon:    GraduationCap,
    bg:      'bg-emerald-50',
    iconBg:  'bg-emerald-500',
    badge:   'bg-emerald-100 text-emerald-700',
    accent:  'border-l-emerald-500',
  },
  class: {
    label:   'Class',
    icon:    CalendarDays,
    bg:      'bg-violet-50',
    iconBg:  'bg-violet-500',
    badge:   'bg-violet-100 text-violet-700',
    accent:  'border-l-violet-500',
  },
  employee: {
    label:   'Staff',
    icon:    Briefcase,
    bg:      'bg-sky-50',
    iconBg:  'bg-sky-500',
    badge:   'bg-sky-100 text-sky-700',
    accent:  'border-l-sky-500',
  },
  grades: {
    label:   'Grades',
    icon:    BookOpen,
    bg:      'bg-teal-50',
    iconBg:  'bg-teal-500',
    badge:   'bg-teal-100 text-teal-700',
    accent:  'border-l-teal-500',
  },
  general: {
    label:   'General',
    icon:    Megaphone,
    bg:      'bg-gray-50',
    iconBg:  'bg-gray-500',
    badge:   'bg-gray-100 text-gray-600',
    accent:  'border-l-gray-400',
  },
}

const TARGET_LABELS = {
  all:      'Everyone',
  class:    'Class',
  cycle:    'Cycle',
  employee: 'Staff Only',
}

const FILTER_TYPES = ['all', ...Object.keys(TYPE_CONFIG)]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Infer announcement "type" from title keywords.
 * Announcements don't have an explicit type field in the schema, so we parse.
 */
function inferType(announcement) {
  const t = (announcement.title || '').toLowerCase()
  if (t.includes('exam') || t.includes('result'))        return 'exam'
  if (t.includes('payment') || t.includes('overdue'))    return 'payment'
  if (t.includes('certificate'))                         return 'certificate'
  if (t.includes('student') || t.includes('removed') || t.includes('enrolled')) return 'student'
  if (t.includes('class') || t.includes('opened'))       return 'class'
  if (t.includes('employee') || t.includes('team member') || t.includes('staff')) return 'employee'
  if (t.includes('grade') || t.includes('score'))        return 'grades'
  return 'general'
}

function getTypeConfig(type) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.general
}

/** Check if an announcement has expired */
function isExpired(announcement) {
  if (!announcement.expires_at) return false
  return new Date(announcement.expires_at) < new Date()
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function TypeBadge({ type, className }) {
  const cfg = getTypeConfig(type)
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide', cfg.badge, className)}>
      {type}
    </span>
  )
}

function TargetBadge({ target_type, className }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 uppercase tracking-wide', className)}>
      <Tag size={9} />
      {TARGET_LABELS[target_type] ?? target_type}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Announcement Card
// ─────────────────────────────────────────────────────────────────────────────

function AnnouncementCard({ announcement, onClick }) {
  const type     = inferType(announcement)
  const cfg      = getTypeConfig(type)
  const Icon     = cfg.icon
  const expired  = isExpired(announcement)

  return (
    <div
      onClick={() => onClick(announcement)}
      className={cn(
        'group relative flex flex-col gap-3 p-5 rounded-lg cursor-pointer',
        'border-l-4 transition-all duration-200 hover:scale-[1.015]',
        cfg.bg,
        cfg.accent,
        expired && 'opacity-50'
      )}
    >
      {/* Icon + badges row */}
      <div className="flex items-start justify-between gap-3">
        <div className={cn('flex items-center justify-center w-10 h-10 rounded-lg shrink-0 transition-transform duration-200 group-hover:scale-110', cfg.iconBg)}>
          <Icon size={18} strokeWidth={2} className="text-white" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <TypeBadge type={type} />
          <TargetBadge target_type={announcement.target_type} />
          {expired && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-200 text-gray-500 uppercase tracking-wide">
              Expired
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold leading-snug text-gray-900 transition-colors line-clamp-2 group-hover:text-gray-700">
        {announcement.title}
      </h3>

      {/* Body preview */}
      <p className="text-xs leading-relaxed text-gray-500 line-clamp-3">
        {announcement.body}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 mt-auto border-t border-black/5">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <User size={10} />
          <span>
            {announcement.createdBy
              ? `${announcement.createdBy.name} ${announcement.createdBy.lastname}`
              : 'System'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <span>{timeAgo(announcement.created_at)}</span>
          <ChevronRight size={12} className="transition-opacity opacity-0 group-hover:opacity-100" />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Detail Modal
// ─────────────────────────────────────────────────────────────────────────────

function DetailModal({ announcement, onClose }) {
  const type = inferType(announcement)
  const cfg  = getTypeConfig(type)
  const Icon = cfg.icon

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-modal bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg overflow-hidden bg-white rounded-lg animate-slide-in-up">
        {/* Colored header strip */}
        <div className={cn('flex items-center gap-4 p-6', cfg.bg, `border-l-4 ${cfg.accent}`)}>
          <div className={cn('flex items-center justify-center w-12 h-12 rounded-lg shrink-0', cfg.iconBg)}>
            <Icon size={22} strokeWidth={2} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <TypeBadge type={type} />
              <TargetBadge target_type={announcement.target_type} />
              {isExpired(announcement) && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-200 text-gray-500 uppercase tracking-wide">
                  Expired
                </span>
              )}
            </div>
            <h2 className="text-base font-bold leading-snug text-gray-900">
              {announcement.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 text-gray-400 transition-colors rounded-md shrink-0 hover:bg-black/10 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-sm leading-relaxed text-gray-700">
            {announcement.body}
          </p>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
            <MetaItem icon={User} label="Posted by">
              {announcement.createdBy
                ? `${announcement.createdBy.name} ${announcement.createdBy.lastname}`
                : 'System'}
            </MetaItem>
            <MetaItem icon={CalendarDays} label="Posted">
              {formatDate(announcement.created_at)}
            </MetaItem>
            {announcement.expires_at && (
              <MetaItem icon={Info} label="Expires">
                {formatDate(announcement.expires_at)}
              </MetaItem>
            )}
            {announcement.target_id && (
              <MetaItem icon={Tag} label="Target ID">
                #{announcement.target_id}
              </MetaItem>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 bg-gray-100 rounded-md hover:bg-gray-200 hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function MetaItem({ icon: Icon, label, children }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        <Icon size={10} />
        {label}
      </span>
      <span className="text-xs font-medium text-gray-700">{children}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats bar
// ─────────────────────────────────────────────────────────────────────────────

function StatsBar({ announcements }) {
  const counts = {}
  announcements.forEach((a) => {
    const t = inferType(a)
    counts[t] = (counts[t] || 0) + 1
  })

  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4)

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        label="Total"
        value={announcements.length}
        icon={Bell}
        className="text-white bg-blue-500"
      />
      {top.map(([type, count]) => {
        const cfg = getTypeConfig(type)
        const Ic  = cfg.icon
        return (
          <StatCard
            key={type}
            label={cfg.label}
            value={count}
            icon={Ic}
            className={cn(cfg.bg, 'text-gray-700')}
          />
        )
      })}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, className }) {
  return (
    <div className={cn('flex items-center gap-3 p-4 rounded-lg', className)}>
      <Icon size={20} strokeWidth={2} className="opacity-80 shrink-0" />
      <div>
        <p className="text-xl font-extrabold leading-none">{value}</p>
        <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ hasFilter }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 col-span-full">
      <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg">
        <Bell size={28} strokeWidth={1.5} className="text-gray-300" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-500">
          {hasFilter ? 'No announcements match your filters' : 'No announcements yet'}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {hasFilter
            ? 'Try adjusting or clearing your filters.'
            : 'Announcements are generated automatically when events occur.'}
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AnnouncementsPage() {
  const { isDark } = useThemeStore()

  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [search, setSearch]               = useState('')
  const [typeFilter, setTypeFilter]       = useState('all')
  const [targetFilter, setTargetFilter]   = useState('all')
  const [selected, setSelected]           = useState(null)
  const [refreshing, setRefreshing]       = useState(false)

  // ── Fetch ───────────────────────────────────────────────────────────────
  const fetchAnnouncements = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else         setRefreshing(true)
    setError(null)
    try {
      const res = await api.get('/api/announcements', {
        params: { orderBy: 'created_at:desc', pageSize: 200 },
      })
      setAnnouncements(Array.isArray(res.data?.data) ? res.data.data : [])
    } catch (err) {
      setError('Failed to load announcements. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchAnnouncements() }, [fetchAnnouncements])

  // ── Filter ──────────────────────────────────────────────────────────────
  const filtered = announcements.filter((a) => {
    const matchSearch = !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.body.toLowerCase().includes(search.toLowerCase())
    const matchType   = typeFilter   === 'all' || inferType(a) === typeFilter
    const matchTarget = targetFilter === 'all' || a.target_type === targetFilter
    return matchSearch && matchType && matchTarget
  })

  const hasFilter = search || typeFilter !== 'all' || targetFilter !== 'all'

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-16 bg-gray-50">

      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-blue-500">
        {/* Geometric decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 translate-x-24 -translate-y-24 bg-blue-600 rounded-full opacity-30" />
        <div className="absolute bottom-0 left-0 w-40 h-40 -translate-x-10 translate-y-10 bg-blue-400 rounded-lg opacity-20 rotate-12" />

        <div className="relative px-6 py-10 mx-auto max-w-7xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20">
                  <Megaphone size={20} strokeWidth={2} className="text-white" />
                </div>
                <span className="text-xs font-semibold tracking-widest text-blue-100 uppercase">
                  System Feed
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Announcements
              </h1>
              <p className="mt-1 text-sm text-blue-100">
                Auto-generated from system events — exams, classes, grades, and more.
              </p>
            </div>

            {/* Refresh button */}
            <button
              onClick={() => fetchAnnouncements(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 rounded-md bg-white/20 hover:bg-white/30 hover:scale-105 disabled:opacity-60 shrink-0"
            >
              <RefreshCw size={14} strokeWidth={2} className={cn(refreshing && 'animate-spin')} />
              Refresh
            </button>
          </div>

          {/* Stats bar */}
          {!loading && announcements.length > 0 && (
            <div className="mt-8">
              <StatsBar announcements={announcements} />
            </div>
          )}
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 px-6 mx-auto -mt-4 max-w-7xl">
        <div className="flex flex-col gap-3 p-4 bg-white border border-gray-200 rounded-lg sm:flex-row">

          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute text-gray-400 -translate-y-1/2 pointer-events-none left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search announcements…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-2 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 text-sm bg-gray-100 rounded-md text-gray-700 focus:outline-none focus:bg-white focus:border-2 focus:border-blue-500 transition-all min-w-[140px]"
          >
            <option value="all">All Types</option>
            {Object.entries(TYPE_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* Target filter */}
          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            className="px-3 py-2.5 text-sm bg-gray-100 rounded-md text-gray-700 focus:outline-none focus:bg-white focus:border-2 focus:border-blue-500 transition-all min-w-[140px]"
          >
            <option value="all">All Targets</option>
            {Object.entries(TARGET_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          {/* Clear */}
          {hasFilter && (
            <button
              onClick={() => { setSearch(''); setTypeFilter('all'); setTargetFilter('all') }}
              className="px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-md transition-all duration-200 whitespace-nowrap"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Type chips row */}
        <div className="flex items-center gap-2 pb-1 mt-3 overflow-x-auto scrollbar-hide">
          {FILTER_TYPES.map((t) => {
            const cfg    = t === 'all' ? null : getTypeConfig(t)
            const active = typeFilter === t
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-all duration-200 hover:scale-105',
                  active
                    ? t === 'all'
                      ? 'bg-blue-500 text-white'
                      : cn(cfg.iconBg, 'text-white')
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                )}
              >
                {cfg && <cfg.icon size={11} strokeWidth={2} />}
                {t === 'all' ? 'All' : cfg.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="px-6 mx-auto mt-6 max-w-7xl">

        {/* Result count */}
        {!loading && (
          <p className="mb-4 text-xs font-medium text-gray-400">
            {hasFilter
              ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} — filtered from ${announcements.length} total`
              : `${announcements.length} announcement${announcements.length !== 1 ? 's' : ''}`}
          </p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 border-l-4 border-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center gap-3 p-5 border-l-4 border-red-500 rounded-lg bg-red-50">
            <Info size={18} className="text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              onClick={() => fetchAnnouncements()}
              className="ml-auto text-xs font-semibold text-red-600 underline hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {/* Cards grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0
              ? <EmptyState hasFilter={!!hasFilter} />
              : filtered.map((a) => (
                  <AnnouncementCard
                    key={a.id}
                    announcement={a}
                    onClick={setSelected}
                  />
                ))
            }
          </div>
        )}
      </div>

      {/* ── Detail Modal ────────────────────────────────────────────────── */}
      {selected && (
        <DetailModal
          announcement={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
