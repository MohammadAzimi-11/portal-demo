// ─────────────────────────────────────────────────────────────────────────────
// MasterComponent.jsx
//
// A universal, config-driven CRUD component.
// Drop it onto any page and pass a config object — it handles the full
// List / New / Edit workflow including search, filters, pagination,
// form validation, create, update, and delete.
//
// ─────────────────────────────────────────────────────────────────────────────
//
// CONFIG SHAPE — full reference
//
// {
//   // ── Required ────────────────────────────────────────────────────────────
//   apiPath:       '/api/students',        // base REST path
//   entityName:    'Student',              // singular display name
//
//   // ── List ────────────────────────────────────────────────────────────────
//   columns: [
//     {
//       key:      'name',                  // dot-notation key e.g. 'gender.name'
//       label:    'Name',
//       sortable: true,                    // click header to sort
//       sortKey:  'name',                  // override sort param key (default = key)
//       width:    '200px',                 // optional fixed width
//       align:    'left' | 'right' | 'center',
//       className: '',                     // extra TD classes
//       render:   (value, row) => <span>…</span>,  // custom cell renderer
//     },
//   ],
//   filters: [
//     {
//       key:   'gender_id',                // query param name sent to API
//       label: 'Gender',
//       options: [                         // static options
//         { value: 1, label: 'Male' },
//         { value: 2, label: 'Female' },
//       ],
//       // OR fetch from API:
//       fetchOptions: {
//         url:      '/api/genders',
//         valueKey: 'id',
//         labelKey: 'name',                // or: (item) => `${item.name}`
//       },
//     },
//   ],
//   searchable:        true,               // show search bar (default true)
//   searchPlaceholder: 'Search students…',
//   defaultOrderBy:    'created_at:desc',  // initial sort
//   defaultParams:     {},                 // extra static query params
//   pageSize:          15,                 // rows per page
//   emptyMessage:      'No students yet.',
//
//   // ── Form ────────────────────────────────────────────────────────────────
//   fields: [
//     {
//       key:          'name',
//       label:        'First Name',
//       type:         'text',              // text | number | email | password | tel
//                                          // textarea | select | date | toggle | boolean | file
//       required:     true,
//       placeholder:  'Enter first name',
//       defaultValue: '',
//       hint:         'As it will appear on the certificate.',
//       fullWidth:    false,               // span both columns
//       createOnly:   false,               // hide field in edit mode
//       readOnly:     false,               // skip in payload (still shown)
//       hidden:       false,               // remove from form entirely
//       validate:     (value, allValues) => value?.length < 2 ? 'Too short' : null,
//
//       // textarea only
//       rows: 4,
//
//       // number only
//       min: 0, max: 100, step: 1,
//
//       // select only — static options
//       options: [{ value: 1, label: 'Male' }, { value: 2, label: 'Female' }],
//
//       // select only — fetch options from API
//       fetchOptions: {
//         url:      '/api/genders',
//         valueKey: 'id',
//         labelKey: 'name',                // string key or (item) => string function
//         params:   {},                    // extra query params
//       },
//
//       // file only
//       accept: 'image/*',
//     },
//   ],
//
//   // Section groupings for the form (optional)
//   // If omitted, all fields appear in a single 2-column grid.
//   formSections: [
//     {
//       title:   'Personal Info',          // section header label (null to hide)
//       keys:    ['name', 'lastname'],     // field keys in this section
//       columns: 2,                        // 1 | 2 | 3 (default 2)
//     },
//   ],
//
//   // ── Permissions (optional) ───────────────────────────────────────────────
//   // If a permission check returns false, the action button is greyed out
//   // with a tooltip. Pass null/undefined to always allow.
//   permissions: {
//     create: () => true,                  // or: useAuthStore.getState().can('student:create')
//     update: () => true,
//     delete: () => true,
//   },
//
//   // ── Behaviour ───────────────────────────────────────────────────────────
//   allowDelete:      true,               // show Delete button in edit form
//   transformPayload: (payload, mode) => payload,  // mutate before send
//
//   // ── Callbacks ───────────────────────────────────────────────────────────
//   onCreated: (record) => {},
//   onUpdated: (record) => {},
//   onDeleted: ()       => {},
// }
//
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useCallback } from 'react'
import { Plus, List, PenLine, Lock } from 'lucide-react'
import { cn } from '../../../../utils/utils'
import MasterList from './MasterList'
import MasterForm from './MasterForm'

// ── Permission gate helper ────────────────────────────────────────────────────

function checkPermission(permissions, action) {
  if (!permissions?.[action]) return true // no guard = allowed
  return permissions[action]()
}

// ── Tab button ────────────────────────────────────────────────────────────────

function Tab({ label, icon: Icon, active, disabled, disabledReason, onClick, isDark }) {
  const btn = (
    <button
      onClick={disabled ? undefined : onClick}
      title={disabled ? disabledReason : undefined}
      aria-disabled={disabled}
      className={cn(
        'relative flex shrink-0 items-center gap-2 px-3 py-2 text-sm font-semibold rounded-t-md sm:px-4 sm:py-2.5',
        'transition-all duration-200 select-none whitespace-nowrap',
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'cursor-pointer',
        active
          ? isDark
            ? 'bg-gray-900 text-primary-300 border-b-2 border-primary'
            : 'bg-white text-primary border-b-2 border-primary'
          : disabled
          ? isDark
            ? 'text-gray-600'
            : 'text-gray-400'
          : isDark
          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          : 'text-gray-500 hover:text-foreground hover:bg-muted'
      )}
    >
      <Icon size={15} strokeWidth={active ? 2.5 : 2} />
      {label}
      {disabled && <Lock size={11} className="ml-1 opacity-60" />}
    </button>
  )

  return btn
}

// ── MasterComponent ───────────────────────────────────────────────────────────

/**
 * MasterComponent
 *
 * Props:
 *   config   {object}   Full configuration object (see shape above)
 *   isDark   {boolean}  From useThemeStore
 *   title    {string}   Optional override for the page/section title
 *   subtitle {string}   Optional subtitle
 */
export default function MasterComponent({ config, isDark, title, subtitle }) {
  const [tab, setTab]           = useState('list')
  const [editRecord, setEditRecord] = useState(null)

  // Ref used to call refresh() on the list from the parent
  const listRefreshRef = useRef(null)
  config._listRef = listRefreshRef

  const canCreate = checkPermission(config.permissions, 'create')
  const canUpdate = checkPermission(config.permissions, 'update')
  const canDelete = checkPermission(config.permissions, 'delete')

  const handleEdit = useCallback((record) => {
    if (!canUpdate) return
    setEditRecord(record)
    setTab('edit')
  }, [canUpdate])

  const handleSuccess = useCallback((mode, record) => {
    if (mode === 'created') {
      config.onCreated?.(record)
    } else {
      config.onUpdated?.(record)
    }
    setTab('list')
    setEditRecord(null)
    listRefreshRef.current?.refresh()
  }, [config])

  const handleDelete = useCallback(() => {
    config.onDeleted?.()
    setTab('list')
    setEditRecord(null)
    listRefreshRef.current?.refresh()
  }, [config])

  const handleTabChange = (t) => {
    if (t === 'new' && !canCreate) return
    if (t === 'edit' && !editRecord) return
    if (t !== 'edit') setEditRecord(null)
    setTab(t)
  }

  const entityName = config.entityName ?? 'Record'

  return (
    <div className="space-y-0 animate-scale-in">
      {/* ── Page header ───────────────────────────────────────────────── */}
      {(title || subtitle) && (
        <div className="mb-4 sm:mb-6">
          {title && (
            <h2 className={cn(
              'text-2xl font-extrabold tracking-tight',
              isDark ? 'text-white' : 'text-foreground'
            )}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">{subtitle}</p>
          )}
        </div>
      )}

      {/* ── Tab bar ───────────────────────────────────────────────────── */}
      <div className={cn(
        'flex flex-col gap-2 px-3 pt-2 border-b sm:flex-row sm:items-end sm:px-4 sm:pt-0',
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-border'
      )}>
        <div className="flex w-full gap-1 overflow-x-auto sm:flex-1 sm:items-end">
          <Tab
            label="List"
            icon={List}
            active={tab === 'list'}
            isDark={isDark}
            onClick={() => handleTabChange('list')}
          />
          <Tab
            label={`New ${entityName}`}
            icon={Plus}
            active={tab === 'new'}
            disabled={!canCreate}
            disabledReason={`You don't have permission to create ${entityName.toLowerCase()}s.`}
            isDark={isDark}
            onClick={() => handleTabChange('new')}
          />
          <Tab
            label={`Edit ${entityName}`}
            icon={PenLine}
            active={tab === 'edit'}
            disabled={!editRecord || !canUpdate}
            disabledReason={
              !canUpdate
                ? `You don't have permission to edit ${entityName.toLowerCase()}s.`
                : `Select a ${entityName.toLowerCase()} from the list to edit.`
            }
            isDark={isDark}
            onClick={() => handleTabChange('edit')}
          />
        </div>

        {/* Record context badge in edit tab */}
        {tab === 'edit' && editRecord && (
          <div className={cn(
            'mb-2 flex max-w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium sm:mb-0.5 sm:rounded-t-md',
            isDark ? 'bg-primary/10 text-primary-300' : 'bg-primary-50 text-primary-700'
          )}>
            <span className="opacity-60">Editing:</span>
            <span className="font-semibold truncate max-w-[160px]">
              {config.getRecordLabel
                ? config.getRecordLabel(editRecord)
                : editRecord.name
                  ? `${editRecord.name}${editRecord.lastname ? ' ' + editRecord.lastname : ''}`
                  : `#${editRecord.id}`}
            </span>
          </div>
        )}
      </div>

      {/* ── Tab content ───────────────────────────────────────────────── */}
      <div className={cn(
        'rounded-b-lg border border-t-0 p-3 sm:p-4 lg:p-6',
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-border'
      )}>
        {tab === 'list' && (
          <MasterList
            config={config}
            isDark={isDark}
            onEdit={handleEdit}
          />
        )}

        {tab === 'new' && (
          <MasterForm
            config={config}
            mode="new"
            record={null}
            isDark={isDark}
            onSuccess={handleSuccess}
            onDelete={handleDelete}
          />
        )}

        {tab === 'edit' && editRecord && (
          <MasterForm
            config={config}
            mode="edit"
            record={editRecord}
            isDark={isDark}
            onSuccess={handleSuccess}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  )
}
