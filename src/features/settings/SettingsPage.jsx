// ─────────────────────────────────────────────────────────────────────────────
// SettingsPage.jsx
//
// Tabbed settings hub. Left vertical nav + right content panel.
//
// Tabs:
//   1. General Info     → PATCH /api/general/1
//   2. Appearance       → useThemeStore (dark/light)
//   3. Genders          → MasterComponent /api/genders
//   4. Locations        → MasterComponent /api/locations
//   5. Roles            → MasterComponent /api/roles
//   6. Permissions      → custom panel /api/employee-permissions
//   7. Change Password  → POST /api/settings/change-password
//   8. Export Data      → GET  /api/settings/export/*
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react'
import {
    Building2,
    Palette,
    Users,
    MapPin,
    UserCog,
    ShieldCheck,
    Lock,
    Download,
    Sun,
    Moon,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Trash2,
    Plus,
    FileSpreadsheet,
    FileText,
    UsersRound,
    X,
} from 'lucide-react'
import { cn } from '../../utils/utils'
import { useThemeStore } from '../shared/store/useThemeStore'
import MasterComponent from '../shared/components/MasterComponent/MasterComponent'
import api from '../../utils/api'

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

/** Section wrapper — white/dark card with title bar */
function Section({ title, subtitle, icon: Icon, children, isDark, accent = 'primary' }) {
    const accentMap = {
        primary: isDark ? 'bg-primary/20 text-primary-300' : 'bg-primary-50 text-primary-600',
        secondary: isDark ? 'bg-secondary/20 text-secondary-300' : 'bg-secondary-100 text-secondary-700',
        accent: isDark ? 'bg-accent/20 text-accent-300' : 'bg-accent-100 text-accent-700',
        red: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600',
    }

    return (
        <div className={cn('rounded-lg border', isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-border')}>
            {/* Section header */}
            <div className={cn('flex items-center gap-3 px-4 py-4 border-b sm:gap-4 sm:px-6 sm:py-5', isDark ? 'border-gray-800' : 'border-border')}>
                <div className={cn('flex items-center justify-center w-10 h-10 rounded-lg shrink-0', accentMap[accent])}>
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className={cn('text-base font-bold tracking-tight', isDark ? 'text-white' : 'text-foreground')}>
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                    )}
                </div>
            </div>
            <div className="p-4 sm:p-6">{children}</div>
        </div>
    )
}

/** Flat input field matching project style */
function SettingsInput({ label, hint, error, required, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                    {required && <span className="text-destructive ml-0.5">*</span>}
                </label>
            )}
            {children}
            {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
            {error && (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle size={11} /> {error}
                </p>
            )}
        </div>
    )
}

const inputCls = (isDark, error) =>
    cn(
        'w-full px-3 py-2.5 rounded-md text-sm transition-all duration-200 border-2 outline-none',
        isDark
            ? 'bg-gray-800 text-gray-100 placeholder-gray-500 border-gray-700 focus:border-primary focus:bg-gray-800'
            : 'bg-muted text-foreground placeholder-gray-400 border-transparent focus:border-primary focus:bg-white',
        error && 'border-destructive'
    )

/** Inline alert banner */
function Alert({ type = 'error', message }) {
    if (!message) return null
    const styles = {
        error: 'bg-red-50 text-red-700 border-red-200',
        success: 'bg-secondary-100 text-secondary-700 border-secondary-200',
    }
    const Icon = type === 'success' ? CheckCircle2 : AlertCircle
    return (
        <div className={cn('flex items-center gap-2 px-4 py-3 rounded-md text-sm border', styles[type])}>
            <Icon size={15} className="shrink-0" />
            {message}
        </div>
    )
}

/** Primary action button */
function Btn({ onClick, disabled, loading, icon: Icon, children, variant = 'primary', className }) {
    const variants = {
        primary: 'bg-primary hover:bg-primary-600 text-white',
        danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
        muted: 'bg-muted hover:bg-gray-200 text-foreground',
    }
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold',
                'transition-all duration-200 hover:scale-[1.02]',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                variants[variant],
                className
            )}
        >
            {loading ? <Loader2 size={15} className="animate-spin" /> : Icon && <Icon size={15} />}
            {children}
        </button>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1 — GENERAL INFORMATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Only these keys are sent to PATCH — strips id and any unknown fields
 * the API might reject.
 */
const GENERAL_EDITABLE_KEYS = [
    'name', 'brand_color', 'manager', 'owner', 'location',
    'description', 'phone', 'phone2', 'manage_phone',
    'telegram', 'start_time', 'end_time',
]

/** Field definitions — type drives the input element rendered */
const GENERAL_FIELDS = [
    // ── Row 1: identity ─────────────────────────────────────────────────────
    {
        key: 'name', label: 'Academy Name', type: 'text',
        placeholder: 'e.g. Modern Language Academy', required: true,
        fullWidth: true,
    },
    // ── Row 2: people ───────────────────────────────────────────────────────
    { key: 'manager', label: 'Manager', type: 'text', placeholder: 'e.g. Ali Rezaei' },
    { key: 'owner', label: 'Owner', type: 'text', placeholder: 'e.g. Hossein Ahmadi' },
    // ── Row 3: contact ──────────────────────────────────────────────────────
    { key: 'phone', label: 'Primary Phone', type: 'tel', placeholder: '+98 21 1234 5678' },
    { key: 'phone2', label: 'Secondary Phone', type: 'tel', placeholder: '+98 912 345 6789' },
    { key: 'manage_phone', label: 'Management Phone', type: 'tel', placeholder: 'Internal line' },
    { key: 'telegram', label: 'Telegram', type: 'text', placeholder: '@academy_official' },
    // ── Row 4: location ─────────────────────────────────────────────────────
    { key: 'location', label: 'Address', type: 'text', placeholder: 'Full address', fullWidth: true },
    // ── Row 5: hours ────────────────────────────────────────────────────────
    {
        key: 'start_time', label: 'Opening Time', type: 'time',
        hint: 'Academy opening time',
    },
    {
        key: 'end_time', label: 'Closing Time', type: 'time',
        hint: 'Academy closing time',
    },
    // ── Row 6: brand ────────────────────────────────────────────────────────
    {
        key: 'brand_color', label: 'Brand Color', type: 'color',
        hint: 'Used for certificates and printed materials',
    },
    // ── Description — full width textarea, rendered separately ───────────────
]

function GeneralInfoPanel({ isDark }) {
    const [values, setValues] = useState({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [recordId, setRecordId] = useState(null)
    const [alert, setAlert] = useState(null)

    useEffect(() => {
        api.get('/api/general', { params: { limit: 1 } })
            .then((res) => {
                const raw = res.data?.data
                const record = Array.isArray(raw) ? raw[0] : raw
                if (record) {
                    setRecordId(record.id)
                    // Pre-fill only editable keys so no stale server fields leak in
                    const initial = {}
                    for (const k of GENERAL_EDITABLE_KEYS) {
                        initial[k] = record[k] ?? ''
                    }
                    setValues(initial)
                }
            })
            .catch(() => setAlert({ type: 'error', message: 'Failed to load general information.' }))
            .finally(() => setLoading(false))
    }, [])

    const set = (key, val) => setValues((p) => ({ ...p, [key]: val }))

    const handleSave = async () => {
        if (!recordId) return
        if (!values.name?.trim()) {
            setAlert({ type: 'error', message: 'Academy Name is required.' })
            return
        }
        setSaving(true)
        setAlert(null)
        try {
            // Build clean payload — only editable keys, convert '' → null for optionals
            const payload = {}
            for (const k of GENERAL_EDITABLE_KEYS) {
                const v = values[k]
                // 'name' is required — keep as-is; everything else: empty string → null
                payload[k] = (k === 'name') ? v : (v === '' ? null : v)
            }
            await api.patch(`/api/general/${recordId}`, payload)
            setAlert({ type: 'success', message: 'General information saved successfully.' })
        } catch (err) {
            setAlert({ type: 'error', message: err.message })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={22} className="animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Render a single field based on its type
    const renderField = (f) => {
        const val = values[f.key] ?? ''

        // Color picker — show swatch + hex text together
        if (f.type === 'color') {
            return (
                <SettingsInput key={f.key} label={f.label} hint={f.hint}>
                    <div className={cn('flex items-center gap-3 px-3 py-2 rounded-md border-2 transition-all duration-200',
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-muted border-transparent'
                    )}>
                        {/* Native color swatch — clicking opens OS color picker */}
                        <input
                            type="color"
                            value={val || '#3B82F6'}
                            onChange={(e) => set(f.key, e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
                            title="Pick a color"
                        />
                        {/* Editable hex text alongside */}
                        <input
                            type="text"
                            value={val}
                            placeholder="#3B82F6"
                            maxLength={7}
                            onChange={(e) => set(f.key, e.target.value)}
                            className={cn(
                                'flex-1 bg-transparent outline-none text-sm',
                                isDark ? 'text-gray-100 placeholder-gray-500' : 'text-foreground placeholder-gray-400'
                            )}
                        />
                    </div>
                </SettingsInput>
            )
        }

        // Time picker — native time input styled consistently
        if (f.type === 'time') {
            return (
                <SettingsInput key={f.key} label={f.label} hint={f.hint}>
                    <input
                        type="time"
                        value={val}
                        onChange={(e) => set(f.key, e.target.value)}
                        className={inputCls(isDark)}
                    />
                </SettingsInput>
            )
        }

        // Tel input
        if (f.type === 'tel') {
            return (
                <SettingsInput key={f.key} label={f.label} hint={f.hint} required={f.required}>
                    <input
                        type="tel"
                        value={val}
                        placeholder={f.placeholder}
                        onChange={(e) => set(f.key, e.target.value)}
                        className={inputCls(isDark)}
                    />
                </SettingsInput>
            )
        }

        // Default: text
        return (
            <SettingsInput key={f.key} label={f.label} hint={f.hint} required={f.required}>
                <input
                    type="text"
                    value={val}
                    placeholder={f.placeholder}
                    onChange={(e) => set(f.key, e.target.value)}
                    className={inputCls(isDark)}
                />
            </SettingsInput>
        )
    }

    // Separate full-width fields from 2-col fields
    const gridFields = GENERAL_FIELDS.filter((f) => !f.fullWidth)
    const fullWidFields = GENERAL_FIELDS.filter((f) => f.fullWidth)

    return (
        <div className="space-y-5">
            <Alert type={alert?.type} message={alert?.message} />

            {/* Full-width fields first (Academy Name, Address) */}
            <div className="space-y-4">
                {fullWidFields.map(renderField)}
            </div>

            {/* 2-column grid for the rest */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gridFields.map(renderField)}
            </div>

            {/* Description — full-width textarea */}
            <SettingsInput label="Description" hint="Displayed on the academy portal">
                <textarea
                    rows={3}
                    value={values.description ?? ''}
                    placeholder="Short description of the academy…"
                    onChange={(e) => set('description', e.target.value)}
                    className={cn(inputCls(isDark), 'resize-y')}
                />
            </SettingsInput>

            <div className="flex justify-end pt-2">
                <Btn onClick={handleSave} loading={saving} icon={Save}>
                    Save Changes
                </Btn>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2 — APPEARANCE
// ─────────────────────────────────────────────────────────────────────────────

function AppearancePanel({ isDark }) {
    const { toggleTheme } = useThemeStore()

    return (
        <div className="space-y-4">
            {/* Theme toggle card */}
            <div
                onClick={toggleTheme}
                className={cn(
                    'group flex items-center justify-between px-6 py-5 rounded-lg cursor-pointer',
                    'transition-all duration-200 hover:scale-[1.01]',
                    isDark ? 'bg-gray-800' : 'bg-muted'
                )}
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        'flex items-center justify-center w-11 h-11 rounded-lg transition-transform duration-200 group-hover:scale-110',
                        isDark ? 'bg-accent/20 text-accent-400' : 'bg-primary-50 text-primary-600'
                    )}>
                        {isDark ? <Moon size={20} strokeWidth={2.5} /> : <Sun size={20} strokeWidth={2.5} />}
                    </div>
                    <div>
                        <p className={cn('font-semibold text-sm', isDark ? 'text-white' : 'text-foreground')}>
                            {isDark ? 'Dark Mode' : 'Light Mode'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                        </p>
                    </div>
                </div>

                {/* Toggle pill */}
                <div className={cn(
                    'relative w-12 h-6 rounded-full transition-colors duration-300',
                    isDark ? 'bg-primary' : 'bg-gray-300'
                )}>
                    <span className={cn(
                        'absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300',
                        isDark ? 'left-7' : 'left-1'
                    )} />
                </div>
            </div>

            <p className="text-xs text-muted-foreground px-1">
                Your theme preference is saved automatically and persists across sessions.
            </p>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3, 4, 5 — GENDERS / LOCATIONS / ROLES  (via MasterComponent)
// ─────────────────────────────────────────────────────────────────────────────

function buildSimpleConfig({ apiPath, entityName, namePlaceholder, hasQuantity = false }) {
    return {
        apiPath,
        entityName,
        searchPlaceholder: `Search ${entityName.toLowerCase()}s…`,
        pageSize: 10,
        emptyMessage: `No ${entityName.toLowerCase()}s yet.`,
        columns: [
            {
                key: 'id', label: 'ID', width: '60px', sortable: true,
                render: (v) => <span className="text-xs font-mono text-muted-foreground">#{v}</span>,
            },
            {
                key: 'name', label: 'Name', sortable: true,
                render: (v) => <span className="font-semibold text-sm">{v}</span>
            },
            ...(hasQuantity
                ? [{
                    key: 'quantity', label: 'Capacity', align: 'right',
                    render: (v) => v != null
                        ? <span className="font-mono text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded">{v}</span>
                        : <span className="text-muted-foreground opacity-40">—</span>,
                }]
                : []),
        ],
        fields: [
            { key: 'name', label: 'Name', type: 'text', required: true, placeholder: namePlaceholder },
            ...(hasQuantity
                ? [{ key: 'quantity', label: 'Capacity', type: 'number', min: 1, hint: 'Maximum number of students' }]
                : []),
        ],
        getRecordLabel: (r) => r.name,
        allowDelete: true,
    }
}

function GendersPanel({ isDark }) {
    return (
        <MasterComponent
            config={buildSimpleConfig({ apiPath: '/api/genders', entityName: 'Gender', namePlaceholder: 'e.g. Male, Female' })}
            isDark={isDark}
        />
    )
}

function LocationsPanel({ isDark }) {
    return (
        <MasterComponent
            config={buildSimpleConfig({ apiPath: '/api/locations', entityName: 'Location', namePlaceholder: 'e.g. Class A, Main Hall', hasQuantity: true })}
            isDark={isDark}
        />
    )
}

function RolesPanel({ isDark }) {
    return (
        <MasterComponent
            config={buildSimpleConfig({ apiPath: '/api/roles', entityName: 'Role', namePlaceholder: 'e.g. Teacher, Accountant' })}
            isDark={isDark}
        />
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 6 — EMPLOYEE PERMISSIONS
// ─────────────────────────────────────────────────────────────────────────────

function PermissionsPanel({ isDark }) {
    const [employees, setEmployees] = useState([])
    const [permissions, setPermissions] = useState([])
    const [assignments, setAssignments] = useState([]) // EmployeePermission[]
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(null) // employeeId being modified
    const [alert, setAlert] = useState(null)

    // New assignment form state
    const [form, setForm] = useState({ employee_id: '', permission_id: '' })

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const [empRes, permRes, assignRes] = await Promise.all([
                api.get('/api/employees', { params: { limit: 0 } }),
                api.get('/api/permissions', { params: { limit: 0 } }),
                api.get('/api/employee-permissions', { params: { limit: 0 } }),
            ])
            setEmployees(empRes.data?.data ?? [])
            setPermissions(permRes.data?.data ?? [])
            setAssignments(assignRes.data?.data ?? [])
        } catch (err) {
            setAlert({ type: 'error', message: err.message })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const handleAssign = async () => {
        if (!form.employee_id || !form.permission_id) return
        setSaving('add')
        setAlert(null)
        try {
            await api.post('/api/employee-permissions', {
                employee_id: Number(form.employee_id),
                permission_id: Number(form.permission_id),
            })
            setForm({ employee_id: '', permission_id: '' })
            await load()
            setAlert({ type: 'success', message: 'Permission assigned.' })
        } catch (err) {
            setAlert({ type: 'error', message: err.message })
        } finally {
            setSaving(null)
        }
    }

    const handleRevoke = async (assignmentId) => {
        setSaving(assignmentId)
        setAlert(null)
        try {
            await api.delete(`/api/employee-permissions/${assignmentId}`)
            await load()
        } catch (err) {
            setAlert({ type: 'error', message: err.message })
        } finally {
            setSaving(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={22} className="animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Group assignments by employee_id for display
    const byEmployee = {}
    for (const a of assignments) {
        const eid = a.employee?.id
        if (!eid) continue
        if (!byEmployee[eid]) byEmployee[eid] = { employee: a.employee, perms: [] }
        byEmployee[eid].perms.push(a)
    }

    return (
        <div className="space-y-5">
            <Alert type={alert?.type} message={alert?.message} />

            {/* ── Assign form ── */}
            <div className={cn('flex flex-col sm:flex-row gap-3 p-4 rounded-lg', isDark ? 'bg-gray-800' : 'bg-muted')}>
                <select
                    value={form.employee_id}
                    onChange={(e) => setForm((p) => ({ ...p, employee_id: e.target.value }))}
                    className={cn(inputCls(isDark), 'flex-1')}
                >
                    <option value="">Select Employee…</option>
                    {employees.map((e) => (
                        <option key={e.id} value={e.id}>{e.name} {e.lastname}</option>
                    ))}
                </select>

                <select
                    value={form.permission_id}
                    onChange={(e) => setForm((p) => ({ ...p, permission_id: e.target.value }))}
                    className={cn(inputCls(isDark), 'flex-1')}
                >
                    <option value="">Select Permission…</option>
                    {permissions.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>

                <Btn
                    onClick={handleAssign}
                    loading={saving === 'add'}
                    icon={Plus}
                    disabled={!form.employee_id || !form.permission_id}
                >
                    Assign
                </Btn>
            </div>

            {/* ── Employee permission list ── */}
            {Object.keys(byEmployee).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                    No permissions assigned yet. Use the form above to get started.
                </p>
            ) : (
                <div className="space-y-3">
                    {Object.values(byEmployee).map(({ employee, perms }) => (
                        <div
                            key={employee.id}
                            className={cn('rounded-lg border p-4', isDark ? 'border-gray-800 bg-gray-800/50' : 'border-border bg-muted/40')}
                        >
                            <p className={cn('text-sm font-semibold mb-3', isDark ? 'text-white' : 'text-foreground')}>
                                {employee.name} {employee.lastname}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {perms.map((a) => (
                                    <span
                                        key={a.id}
                                        className={cn(
                                            'inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-md text-xs font-medium',
                                            isDark ? 'bg-primary/15 text-primary-300' : 'bg-primary-50 text-primary-700'
                                        )}
                                    >
                                        {a.permission?.name}
                                        <button
                                            onClick={() => handleRevoke(a.id)}
                                            disabled={saving === a.id}
                                            className={cn(
                                                'flex items-center justify-center w-5 h-5 rounded hover:bg-red-500 hover:text-white transition-colors',
                                                isDark ? 'text-primary-400' : 'text-primary-500'
                                            )}
                                        >
                                            {saving === a.id
                                                ? <Loader2 size={10} className="animate-spin" />
                                                : <X size={10} />}
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 7 — CHANGE PASSWORD
// ─────────────────────────────────────────────────────────────────────────────

function ChangePasswordPanel({ isDark }) {
    const [employees, setEmployees] = useState([])
    const [loadingEmps, setLoadingEmps] = useState(true)
    const [form, setForm] = useState({ employee_id: '', current_password: '', new_password: '', confirm_password: '' })
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const [alert, setAlert] = useState(null)

    useEffect(() => {
        api.get('/api/employees', { params: { limit: 0 } })
            .then((r) => setEmployees(r.data?.data ?? []))
            .catch(() => { })
            .finally(() => setLoadingEmps(false))
    }, [])

    const set = (k, v) => {
        setForm((p) => ({ ...p, [k]: v }))
        setErrors((p) => { const n = { ...p }; delete n[k]; return n })
    }

    const handleSubmit = async () => {
        const errs = {}
        if (!form.employee_id) errs.employee_id = 'Select an employee'
        if (!form.current_password) errs.current_password = 'Required'
        if (!form.new_password) errs.new_password = 'Required'
        else if (form.new_password.length < 8) errs.new_password = 'At least 8 characters'
        if (form.new_password !== form.confirm_password) errs.confirm_password = 'Passwords do not match'

        if (Object.keys(errs).length) { setErrors(errs); return }

        setSaving(true)
        setAlert(null)
        try {
            await api.post('/api/settings/change-password', {
                employee_id: Number(form.employee_id),
                current_password: form.current_password,
                new_password: form.new_password,
            })
            setAlert({ type: 'success', message: 'Password changed successfully.' })
            setForm({ employee_id: form.employee_id, current_password: '', new_password: '', confirm_password: '' })
        } catch (err) {
            setAlert({ type: 'error', message: err.message })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-md space-y-5">
            <Alert type={alert?.type} message={alert?.message} />

            <SettingsInput label="Employee" required error={errors.employee_id}>
                <select
                    value={form.employee_id}
                    onChange={(e) => set('employee_id', e.target.value)}
                    disabled={loadingEmps}
                    className={inputCls(isDark, errors.employee_id)}
                >
                    <option value="">Select employee…</option>
                    {employees.map((e) => (
                        <option key={e.id} value={e.id}>{e.name} {e.lastname}</option>
                    ))}
                </select>
            </SettingsInput>

            <SettingsInput label="Current Password" required error={errors.current_password}>
                <input
                    type="password"
                    value={form.current_password}
                    placeholder="Current password"
                    onChange={(e) => set('current_password', e.target.value)}
                    className={inputCls(isDark, errors.current_password)}
                />
            </SettingsInput>

            <SettingsInput label="New Password" required error={errors.new_password} hint="At least 8 characters">
                <input
                    type="password"
                    value={form.new_password}
                    placeholder="New password"
                    onChange={(e) => set('new_password', e.target.value)}
                    className={inputCls(isDark, errors.new_password)}
                />
            </SettingsInput>

            <SettingsInput label="Confirm New Password" required error={errors.confirm_password}>
                <input
                    type="password"
                    value={form.confirm_password}
                    placeholder="Repeat new password"
                    onChange={(e) => set('confirm_password', e.target.value)}
                    className={inputCls(isDark, errors.confirm_password)}
                />
            </SettingsInput>

            <Btn onClick={handleSubmit} loading={saving} icon={Lock}>
                Change Password
            </Btn>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 8 — EXPORT DATA
// ─────────────────────────────────────────────────────────────────────────────

function ExportPanel({ isDark }) {
    const [downloading, setDownloading] = useState(null) // key of active download
    const [alert, setAlert] = useState(null)

    const handleDownload = async (key, url, filename) => {
        setDownloading(key)
        setAlert(null)
        try {
            const res = await api.get(url, { responseType: 'blob' })
            const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(link.href)
            setAlert({ type: 'success', message: `${filename} exported successfully.` })
        } catch (err) {
            setAlert({ type: 'error', message: `Export failed: ${err.message}` })
        } finally {
            setDownloading(null)
        }
    }

    const exports = [
        {
            key: 'students',
            label: 'All Students',
            description: 'Name, USID, phone, gender, registration date',
            icon: UsersRound,
            url: '/api/settings/export/students',
            filename: 'students',
            accent: 'primary',
        },
        {
            key: 'payments',
            label: 'All Payments',
            description: 'Student, amount, discount, status, due date, collected by',
            icon: FileSpreadsheet,
            url: '/api/settings/export/payments',
            filename: 'payments',
            accent: 'secondary',
        },
        {
            key: 'enrollments',
            label: 'Enrollments',
            description: 'Student-class enrollment records with cycle and teacher info',
            icon: FileText,
            url: '/api/settings/export/enrollments',
            filename: 'enrollments',
            accent: 'accent',
        },
    ]

    const accentStyle = {
        primary: isDark ? 'bg-primary/15 text-primary-300' : 'bg-primary-50 text-primary-700',
        secondary: isDark ? 'bg-secondary/15 text-secondary-300' : 'bg-secondary-100 text-secondary-700',
        accent: isDark ? 'bg-accent/15 text-accent-300' : 'bg-accent-100 text-accent-700',
    }

    return (
        <div className="space-y-4">
            <Alert type={alert?.type} message={alert?.message} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {exports.map((exp) => {
                    const Icon = exp.icon
                    const isLoading = downloading === exp.key
                    return (
                        <div
                            key={exp.key}
                            className={cn(
                                'group rounded-lg p-5 transition-all duration-200 hover:scale-[1.02] cursor-pointer',
                                isDark ? 'bg-gray-800' : 'bg-muted'
                            )}
                            onClick={() => !isLoading && handleDownload(exp.key, exp.url, exp.filename)}
                        >
                            <div className={cn(
                                'flex items-center justify-center w-11 h-11 rounded-lg mb-4 transition-transform duration-200 group-hover:scale-110',
                                accentStyle[exp.accent]
                            )}>
                                <Icon size={20} strokeWidth={2.5} />
                            </div>
                            <p className={cn('font-bold text-sm mb-1', isDark ? 'text-white' : 'text-foreground')}>
                                {exp.label}
                            </p>
                            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                                {exp.description}
                            </p>
                            <div className={cn(
                                'inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold',
                                'transition-all duration-200',
                                isLoading
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-primary text-white group-hover:bg-primary-600'
                            )}>
                                {isLoading
                                    ? <><Loader2 size={12} className="animate-spin" /> Exporting…</>
                                    : <><Download size={12} /> Download CSV</>}
                            </div>
                        </div>
                    )
                })}
            </div>

            <p className="text-xs text-muted-foreground px-1 pt-2">
                Files are exported in CSV format with UTF-8 encoding. Excel will open them correctly.
            </p>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS PAGE — main component
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
    {
        id: 'general',
        label: 'General Info',
        icon: Building2,
        accent: 'primary',
        title: 'General Information',
        subtitle: 'Academy name, contact details, and working hours',
    },
    {
        id: 'appearance',
        label: 'Appearance',
        icon: Palette,
        accent: 'accent',
        title: 'Appearance',
        subtitle: 'Theme and display preferences',
    },
    {
        id: 'genders',
        label: 'Genders',
        icon: Users,
        accent: 'secondary',
        title: 'Gender Options',
        subtitle: 'Manage gender choices for students and employees',
    },
    {
        id: 'locations',
        label: 'Locations',
        icon: MapPin,
        accent: 'secondary',
        title: 'Locations & Classrooms',
        subtitle: 'Manage physical spaces and their capacities',
    },
    {
        id: 'roles',
        label: 'Roles',
        icon: UserCog,
        accent: 'primary',
        title: 'Employee Roles',
        subtitle: 'Create and manage staff role titles',
    },
    {
        id: 'permissions',
        label: 'Permissions',
        icon: ShieldCheck,
        accent: 'primary',
        title: 'Employee Permissions',
        subtitle: 'Assign and revoke access permissions per employee',
    },
    {
        id: 'password',
        label: 'Password',
        icon: Lock,
        accent: 'red',
        title: 'Change Password',
        subtitle: 'Update login credentials for any employee',
    },
    {
        id: 'export',
        label: 'Export Data',
        icon: Download,
        accent: 'secondary',
        title: 'Export Data',
        subtitle: 'Download records as CSV files',
    },
]

export default function SettingsPage() {
    const { isDark } = useThemeStore()
    const [activeTab, setActiveTab] = useState('general')

    const tab = TABS.find((t) => t.id === activeTab) ?? TABS[0]

    const renderPanel = () => {
        switch (activeTab) {
            case 'general': return <GeneralInfoPanel isDark={isDark} />
            case 'appearance': return <AppearancePanel isDark={isDark} />
            case 'genders': return <GendersPanel isDark={isDark} />
            case 'locations': return <LocationsPanel isDark={isDark} />
            case 'roles': return <RolesPanel isDark={isDark} />
            case 'permissions': return <PermissionsPanel isDark={isDark} />
            case 'password': return <ChangePasswordPanel isDark={isDark} />
            case 'export': return <ExportPanel isDark={isDark} />
            default: return null
        }
    }

    return (
        <div className="animate-scale-in">
            {/* ── Page header ─────────────────────────────────────────────── */}
            <div className="mb-4 sm:mb-6">
                <h2 className={cn('text-2xl font-extrabold tracking-tight', isDark ? 'text-white' : 'text-foreground')}>
                    Settings
                </h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
                    Manage academy configuration, roles, permissions, and data exports.
                </p>
            </div>

            {/* ── Two-column layout: left nav + right content ─────────────── */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">

                {/* ── Left vertical tab nav ─────────────────────────────────── */}
                <nav className={cn(
                    'flex w-full gap-1 overflow-x-auto rounded-lg border p-1 lg:sticky lg:top-20 lg:block lg:w-52 lg:shrink-0 lg:overflow-hidden lg:p-0',
                    isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-border'
                )}>
                    {TABS.map((t) => {
                        const Icon = t.icon
                        const isActive = activeTab === t.id
                        return (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={cn(
                                    'flex shrink-0 items-center gap-2 px-3 py-2.5 text-sm font-medium lg:w-full lg:gap-3 lg:px-4 lg:py-3',
                                    'transition-all duration-150 text-left rounded-md border-b-0 lg:rounded-none lg:border-b lg:last:border-b-0',
                                    isDark ? 'border-gray-800' : 'border-border',
                                    isActive
                                        ? isDark
                                            ? 'bg-primary/15 text-primary-300 lg:border-l-4 lg:border-l-primary lg:pl-3'
                                            : 'bg-primary-50 text-primary-700 lg:border-l-4 lg:border-l-primary lg:pl-3'
                                        : isDark
                                            ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                            : 'text-gray-600 hover:bg-muted hover:text-foreground'
                                )}
                            >
                                <Icon
                                    size={16}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={isActive ? (isDark ? 'text-primary-300' : 'text-primary-600') : ''}
                                />
                                <span className="whitespace-nowrap">{t.label}</span>
                            </button>
                        )
                    })}
                </nav>

                {/* ── Right content panel ───────────────────────────────────── */}
                <div className="flex-1 min-w-0">
                    <Section
                        key={activeTab}
                        title={tab.title}
                        subtitle={tab.subtitle}
                        icon={tab.icon}
                        isDark={isDark}
                        accent={tab.accent}
                    >
                        {renderPanel()}
                    </Section>
                </div>
            </div>
        </div>
    )
}
