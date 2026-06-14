// ─────────────────────────────────────────────────────────────────────────────
// MasterForm.jsx
//
// Renders the New / Edit form driven entirely by the `fields` config array.
// Handles all field types: text, number, textarea, select (static + async),
// date, toggle, and file upload.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react'
import { Loader2, AlertCircle, Trash2, Save, Plus } from 'lucide-react'
import { cn } from '../../../../utils/utils'
import api from '../../../../utils/api'

// ── Field renderers ───────────────────────────────────────────────────────────

function FieldWrapper({ label, required, error, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-destructive flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  )
}

function InputField({ field, value, onChange, error, isDark }) {
  return (
    <FieldWrapper label={field.label} required={field.required} error={error} hint={field.hint}>
      <input
        type={field.type === 'number' ? 'number' : field.inputType ?? 'text'}
        value={value ?? ''}
        placeholder={field.placeholder ?? ''}
        min={field.min}
        max={field.max}
        step={field.step}
        onChange={(e) => onChange(field.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
        className={cn(
          'w-full px-3 py-2.5 rounded-md text-sm transition-all duration-200',
          'border-2 outline-none',
          isDark
            ? 'bg-gray-800 text-gray-100 placeholder-gray-500 border-gray-700 focus:border-primary focus:bg-gray-800'
            : 'bg-muted text-foreground placeholder-gray-400 border-transparent focus:border-primary focus:bg-white',
          error && 'border-destructive'
        )}
      />
    </FieldWrapper>
  )
}

function TextareaField({ field, value, onChange, error, isDark }) {
  return (
    <FieldWrapper label={field.label} required={field.required} error={error} hint={field.hint}>
      <textarea
        value={value ?? ''}
        placeholder={field.placeholder ?? ''}
        rows={field.rows ?? 3}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full px-3 py-2.5 rounded-md text-sm transition-all duration-200 resize-y',
          'border-2 outline-none',
          isDark
            ? 'bg-gray-800 text-gray-100 placeholder-gray-500 border-gray-700 focus:border-primary focus:bg-gray-800'
            : 'bg-muted text-foreground placeholder-gray-400 border-transparent focus:border-primary focus:bg-white',
          error && 'border-destructive'
        )}
      />
    </FieldWrapper>
  )
}

function SelectField({ field, value, onChange, error, isDark }) {
  const [options, setOptions] = useState(field.options ?? [])
  const [loading, setLoading] = useState(false)

  // Fetch options from API if fetchOptions is configured
  useEffect(() => {
    if (!field.fetchOptions) return

    setLoading(true)
    api
      .get(field.fetchOptions.url, { params: { limit: 0, ...(field.fetchOptions.params ?? {}) } })
      .then((res) => {
        const raw = res.data?.data ?? []
        setOptions(
          raw.map((item) => ({
            value: item[field.fetchOptions.valueKey ?? 'id'],
            label: field.fetchOptions.labelKey
              ? (typeof field.fetchOptions.labelKey === 'function'
                  ? field.fetchOptions.labelKey(item)
                  : item[field.fetchOptions.labelKey])
              : item.name ?? item.id,
          }))
        )
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <FieldWrapper label={field.label} required={field.required} error={error} hint={field.hint}>
      <div className="relative">
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : (isNaN(e.target.value) ? e.target.value : Number(e.target.value)))}
          disabled={loading}
          className={cn(
            'w-full px-3 py-2.5 rounded-md text-sm transition-all duration-200 appearance-none pr-8',
            'border-2 outline-none cursor-pointer',
            isDark
              ? 'bg-gray-800 text-gray-100 border-gray-700 focus:border-primary'
              : 'bg-muted text-foreground border-transparent focus:border-primary focus:bg-white',
            error && 'border-destructive',
            loading && 'opacity-60 cursor-wait'
          )}
        >
          <option value="">{field.placeholder ?? `Select ${field.label}…`}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading
            ? <Loader2 size={14} className="animate-spin text-muted-foreground" />
            : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          }
        </div>
      </div>
    </FieldWrapper>
  )
}

function DateField({ field, value, onChange, error, isDark }) {
  return (
    <FieldWrapper label={field.label} required={field.required} error={error} hint={field.hint}>
      <input
        type="date"
        value={value ?? ''}
        min={field.min}
        max={field.max}
        onChange={(e) => onChange(e.target.value || null)}
        className={cn(
          'w-full px-3 py-2.5 rounded-md text-sm transition-all duration-200',
          'border-2 outline-none',
          isDark
            ? 'bg-gray-800 text-gray-100 border-gray-700 focus:border-primary'
            : 'bg-muted text-foreground border-transparent focus:border-primary focus:bg-white',
          error && 'border-destructive'
        )}
      />
    </FieldWrapper>
  )
}

function ToggleField({ field, value, onChange, error, isDark }) {
  const checked = Boolean(value)
  return (
    <FieldWrapper label={field.label} required={field.required} error={error} hint={field.hint}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          checked ? 'bg-primary' : isDark ? 'bg-gray-700' : 'bg-gray-300'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </FieldWrapper>
  )
}

function FileField({ field, value, onChange, error, isDark }) {
  const [preview, setPreview] = useState(null)

  const handleChange = (e) => {
    const file = e.target.files?.[0] ?? null
    onChange(file)
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  return (
    <FieldWrapper label={field.label} required={field.required} error={error} hint={field.hint}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-md px-4 py-5 text-center transition-colors duration-200',
          isDark ? 'border-gray-700 hover:border-gray-500' : 'border-border hover:border-primary',
          error && 'border-destructive'
        )}
      >
        <input
          type="file"
          accept={field.accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {preview ? (
          <img src={preview} alt="preview" className="mx-auto max-h-24 rounded object-contain" />
        ) : (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {value instanceof File ? value.name : (field.placeholder ?? 'Click or drag a file here')}
            </p>
            {field.accept && (
              <p className="text-[11px] text-muted-foreground opacity-60">{field.accept}</p>
            )}
          </div>
        )}
      </div>
    </FieldWrapper>
  )
}

// ── Field router ──────────────────────────────────────────────────────────────

function Field({ field, value, onChange, error, isDark }) {
  const props = { field, value, onChange, error, isDark }

  switch (field.type) {
    case 'text':
    case 'number':
    case 'email':
    case 'password':
    case 'tel':
      return <InputField {...props} />
    case 'textarea':
      return <TextareaField {...props} />
    case 'select':
      return <SelectField {...props} />
    case 'date':
      return <DateField {...props} />
    case 'toggle':
    case 'boolean':
      return <ToggleField {...props} />
    case 'file':
      return <FileField {...props} />
    case 'custom':
      if (field.component) {
        const CustomComponent = field.component
        return <CustomComponent {...props} />
      }
      return <div className="text-destructive text-sm">Custom component not defined</div>
    default:
      return <InputField {...props} />
  }
}

// ── Validation ────────────────────────────────────────────────────────────────

function validate(fields, values) {
  const errors = {}
  for (const field of fields) {
    if (field.hidden) continue
    const val = values[field.key]
    const isEmpty = val === null || val === undefined || val === ''

    if (field.required && isEmpty) {
      errors[field.key] = `${field.label} is required`
      continue
    }
    if (field.validate) {
      const msg = field.validate(val, values)
      if (msg) errors[field.key] = msg
    }
  }
  return errors
}

// ── MasterForm ────────────────────────────────────────────────────────────────

/**
 * MasterForm
 *
 * Props:
 *   config        {object}   MasterComponent config
 *   mode          {'new'|'edit'}
 *   record        {object|null}  current record (edit mode)
 *   isDark        {boolean}
 *   onSuccess     {function}  called after create/update
 *   onDelete      {function}  called after delete
 */
export default function MasterForm({ config, mode, record, isDark, onSuccess, onDelete }) {
  const fields = config.fields ?? []
  const resolveRecordId = useCallback((currentRecord) => {
    if (!currentRecord) return null

    const key = config.recordIdKey ?? 'id'
    return currentRecord[key] ?? currentRecord.id ?? null
  }, [config])

  // Build initial values
  const buildInitial = useCallback(() => {
    const defaults = {}
    for (const f of fields) {
      if (f.hidden) continue
      defaults[f.key] = f.defaultValue ?? (f.type === 'toggle' || f.type === 'boolean' ? false : '')
    }
    return defaults
  }, [fields])

  const [values, setValues]   = useState(buildInitial)
  const [errors, setErrors]   = useState({})
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [globalError, setGlobalError]     = useState(null)

  // Populate form when record changes (edit mode)
  useEffect(() => {
    if (mode === 'edit' && record) {
      // Apply transformRecord if defined
      const transformedRecord = config.transformRecord ? config.transformRecord(record) : record
      
      const populated = buildInitial()
      for (const f of fields) {
        if (f.hidden) continue
        const raw = transformedRecord[f.key]
        populated[f.key] = raw !== undefined && raw !== null ? raw : (f.defaultValue ?? '')
      }
      setValues(populated)
      setErrors({})
      setGlobalError(null)
      setConfirmDelete(false)
    } else if (mode === 'new') {
      setValues(buildInitial())
      setErrors({})
      setGlobalError(null)
    }
  }, [mode, record]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }))
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next })
  }

  const handleSubmit = async () => {
    setGlobalError(null)
    const errs = validate(fields, values)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    // Build payload — filter out hidden fields and empty strings → null
    const payload = {}
    for (const f of fields) {
      if (f.hidden || f.readOnly) continue
      if (mode === 'edit' && f.createOnly) continue
      const val = values[f.key]
      if (f.type === 'file' && val instanceof File) continue
      payload[f.key] = val === '' ? null : val
    }

    // Apply custom transform if provided
    const finalPayload = config.transformPayload ? config.transformPayload(payload, mode) : payload

    setSaving(true)
    try {
      if (mode === 'new') {
        const res = await api.post(config.apiPath, finalPayload)
        onSuccess?.('created', res.data?.data)
      } else {
        const recordId = resolveRecordId(record)
        if (recordId === null || recordId === undefined || recordId === '') {
          throw new Error('Unable to update: record ID is missing.')
        }
        const res = await api.patch(`${config.apiPath}/${recordId}`, finalPayload)
        onSuccess?.('updated', res.data?.data)
      }
    } catch (err) {
      setGlobalError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    try {
      const recordId = resolveRecordId(record)
      if (recordId === null || recordId === undefined || recordId === '') {
        throw new Error('Unable to delete: record ID is missing.')
      }
      await api.delete(`${config.apiPath}/${recordId}`)
      onDelete?.()
    } catch (err) {
      setGlobalError(err.message)
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  // Group fields by section if sections are defined
  const sections = config.formSections ?? [{ title: null, keys: fields.map((f) => f.key) }]

  const visibleFields = fields.filter((f) => {
    if (f.hidden) return false
    if (mode === 'edit' && f.createOnly) return false
    return true
  })

  const fieldMap = Object.fromEntries(visibleFields.map((f) => [f.key, f]))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Global error */}
      {globalError && (
        <div className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-md text-sm',
          isDark ? 'bg-red-950/40 text-red-400 border border-red-800' : 'bg-red-50 text-red-700 border border-red-200'
        )}>
          <AlertCircle size={15} className="shrink-0" />
          {globalError}
        </div>
      )}

      {/* Sections */}
      {sections.map((section, si) => {
        const sectionFields = section.keys
          .map((k) => fieldMap[k])
          .filter(Boolean)

        if (sectionFields.length === 0) return null

        return (
          <div key={si} className="space-y-4">
            {section.title && (
              <div className={cn(
                'pb-2 border-b-2',
                isDark ? 'border-gray-800' : 'border-muted'
              )}>
                <p className="text-label text-muted-foreground">{section.title}</p>
              </div>
            )}
            <div className={cn(
              'grid gap-4',
              section.columns === 3
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : section.columns === 1
                ? 'grid-cols-1'
                : 'grid-cols-1 md:grid-cols-2'
            )}>
              {sectionFields.map((field) => (
                <div key={field.key} className={field.fullWidth ? 'col-span-full' : ''}>
                  <Field
                    field={field}
                    value={values[field.key]}
                    onChange={(val) => handleChange(field.key, val)}
                    error={errors[field.key]}
                    isDark={isDark}
                  />
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Actions */}
      <div className={cn(
        'flex flex-col-reverse items-stretch gap-3 pt-4 border-t sm:flex-row sm:items-center',
        isDark ? 'border-gray-800' : 'border-border',
        mode === 'edit' ? 'sm:justify-between' : 'sm:justify-end'
      )}>
        {/* Delete — edit mode only */}
        {mode === 'edit' && config.allowDelete !== false && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || saving}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-all duration-200',
              confirmDelete
                ? 'bg-destructive text-white hover:bg-red-700'
                : isDark
                ? 'bg-red-950/40 text-red-400 hover:bg-red-950/60 border border-red-800'
                : 'bg-red-50 text-red-600 hover:bg-red-100',
              (deleting || saving) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {deleting
              ? <Loader2 size={15} className="animate-spin" />
              : <Trash2 size={15} />
            }
            {confirmDelete ? 'Confirm Delete' : 'Delete'}
          </button>
        )}

        {/* Cancel confirm — only when confirming */}
        {confirmDelete && (
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className={cn(
              'px-4 py-2.5 rounded-md text-sm font-semibold transition-all duration-200',
              isDark ? 'text-gray-400 hover:text-gray-200' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Cancel
          </button>
        )}

        {/* Save */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || deleting}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold text-white',
            'justify-center',
            'bg-primary hover:bg-primary-600 transition-all duration-200 hover:scale-[1.02]',
            (saving || deleting) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {saving
            ? <Loader2 size={15} className="animate-spin" />
            : mode === 'new' ? <Plus size={15} /> : <Save size={15} />
          }
          {mode === 'new' ? `Add ${config.entityName ?? 'Record'}` : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
