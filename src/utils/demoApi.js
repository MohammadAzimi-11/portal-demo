const STORAGE_KEY = 'portal_demo_api_store'
const now = '2026-06-14T10:30:00.000Z'

const seedData = {
  general: [{
    id: 1,
    name: 'Portal Academy',
    brand_color: '#2563eb',
    manager: 'Ahmad Rahimi',
    owner: 'Portal Demo Team',
    location: 'Kabul, Afghanistan',
    description: 'Demo academy profile for the public online preview.',
    phone: '+93 700 123 456',
    phone2: '+93 799 555 222',
    manage_phone: '+93 744 333 111',
    telegram: '@portal_academy',
    start_time: '08:00',
    end_time: '17:00',
    created_at: now,
  }],
  genders: [
    { id: 1, name: 'Male', created_at: '2026-01-04T08:00:00.000Z' },
    { id: 2, name: 'Female', created_at: '2026-01-04T08:05:00.000Z' },
  ],
  roles: [
    { id: 1, name: 'Administrator', created_at: '2026-01-04T08:10:00.000Z' },
    { id: 2, name: 'Teacher', created_at: '2026-01-04T08:15:00.000Z' },
    { id: 3, name: 'Accountant', created_at: '2026-01-04T08:20:00.000Z' },
  ],
  locations: [
    { id: 1, name: 'Main Hall', quantity: 35, created_at: '2026-01-07T08:00:00.000Z' },
    { id: 2, name: 'Class A', quantity: 24, created_at: '2026-01-07T08:05:00.000Z' },
    { id: 3, name: 'Lab Room', quantity: 18, created_at: '2026-01-07T08:10:00.000Z' },
  ],
  permissions: [
    { id: 1, name: 'students.read' },
    { id: 2, name: 'students.write' },
    { id: 3, name: 'reports.view' },
    { id: 4, name: 'settings.manage' },
  ],
  employees: [
    {
      id: 1,
      name: 'Ahmad',
      lastname: 'Rahimi',
      age: 34,
      email: 'ahmad.rahimi@portal.demo',
      phone_number: '+93 700 123 456',
      gender_id: 1,
      role_id: 1,
      salary: 85000,
      bio: 'Academy manager and English instructor.',
      image: null,
      created_at: '2025-09-01T08:00:00.000Z',
    },
    {
      id: 2,
      name: 'Mina',
      lastname: 'Karimi',
      age: 29,
      email: 'mina.karimi@portal.demo',
      phone_number: '+93 799 222 333',
      gender_id: 2,
      role_id: 2,
      salary: 62000,
      bio: 'IELTS and business English teacher.',
      image: null,
      created_at: '2025-10-12T08:00:00.000Z',
    },
    {
      id: 3,
      name: 'Omid',
      lastname: 'Naziri',
      age: 31,
      email: 'omid.naziri@portal.demo',
      phone_number: '+93 744 444 555',
      gender_id: 1,
      role_id: 3,
      salary: 54000,
      bio: 'Finance and enrollment officer.',
      image: null,
      created_at: '2025-11-03T08:00:00.000Z',
    },
  ],
  employeePermissions: [
    { id: 1, employee_id: 1, permission_id: 1 },
    { id: 2, employee_id: 1, permission_id: 2 },
    { id: 3, employee_id: 1, permission_id: 4 },
    { id: 4, employee_id: 2, permission_id: 1 },
  ],
  students: [
    {
      id: 1,
      usid: 'STD-1001',
      name: 'Sara',
      lastname: 'Ahmadi',
      father_name: 'Karim',
      age: 19,
      gender_id: 2,
      phone_1: '+93 799 101 100',
      phone_2: '+93 788 101 100',
      responsible: 'Karim Ahmadi',
      home_address: 'Karte 4, Kabul',
      note: 'Top IELTS student.',
      image: null,
      created_at: '2026-02-03T08:00:00.000Z',
    },
    {
      id: 2,
      usid: 'STD-1002',
      name: 'Omid',
      lastname: 'Hakimi',
      father_name: 'Naser',
      age: 22,
      gender_id: 1,
      phone_1: '+93 700 202 200',
      phone_2: '',
      responsible: 'Naser Hakimi',
      home_address: 'Shahr-e-Naw, Kabul',
      note: 'Needs evening class schedule.',
      image: null,
      created_at: '2026-02-07T08:00:00.000Z',
    },
    {
      id: 3,
      usid: 'STD-1003',
      name: 'Laila',
      lastname: 'Noori',
      father_name: 'Hamed',
      age: 17,
      gender_id: 2,
      phone_1: '+93 744 303 300',
      phone_2: '',
      responsible: 'Hamed Noori',
      home_address: 'Taimani, Kabul',
      note: '',
      image: null,
      created_at: '2026-03-10T08:00:00.000Z',
    },
  ],
  cycles: [
    { id: 1, name: 'English A1 - Spring', start_date: '2026-02-01', end_date: '2026-04-30', created_at: '2026-01-15T08:00:00.000Z' },
    { id: 2, name: 'IELTS Prep - Cohort 7', start_date: '2026-03-01', end_date: '2026-05-30', created_at: '2026-02-10T08:00:00.000Z' },
  ],
  subjects: [
    { id: 1, name: 'Grammar', duration: 24, description: 'Core grammar lessons.', created_at: '2026-01-20T08:00:00.000Z' },
    { id: 2, name: 'Speaking', duration: 30, description: 'Conversation and fluency practice.', created_at: '2026-01-20T08:10:00.000Z' },
    { id: 3, name: 'Writing', duration: 28, description: 'Academic writing and feedback.', created_at: '2026-01-20T08:20:00.000Z' },
  ],
  classes: [
    {
      id: 1,
      cycle_id: 1,
      employee_id: 2,
      location_id: 2,
      name: 'A1 Morning',
      start_date: '2026-02-01',
      end_date: '2026-04-30',
      time_start: '08:00',
      time_end: '09:30',
      created_at: '2026-01-22T08:00:00.000Z',
    },
    {
      id: 2,
      cycle_id: 2,
      employee_id: 2,
      location_id: 1,
      name: 'IELTS Evening',
      start_date: '2026-03-01',
      end_date: '2026-05-30',
      time_start: '16:00',
      time_end: '17:30',
      created_at: '2026-02-12T08:00:00.000Z',
    },
  ],
  cycleSubjects: [
    { id: 1, cycle_id: 1, subject_id: 1 },
    { id: 2, cycle_id: 1, subject_id: 2 },
    { id: 3, cycle_id: 2, subject_id: 1 },
    { id: 4, cycle_id: 2, subject_id: 2 },
    { id: 5, cycle_id: 2, subject_id: 3 },
  ],
  curriculums: [
    { id: 1, name: 'A1 Teaching Plan', cycle_id: 1, class_id: 1, employee_id: 2, created_at: '2026-01-23T08:00:00.000Z' },
    { id: 2, name: 'IELTS Intensive Plan', cycle_id: 2, class_id: 2, employee_id: 2, created_at: '2026-02-14T08:00:00.000Z' },
  ],
  curriculumEntries: [
    {
      id: 1,
      curriculum_id: 1,
      subject_id: 1,
      name: 'Parts of Speech',
      description: 'Nouns, verbs, adjectives, and classroom examples.',
      date: '2026-02-03',
      day: 1,
      created_at: '2026-01-25T08:00:00.000Z',
    },
    {
      id: 2,
      curriculum_id: 1,
      subject_id: 2,
      name: 'Self Introduction',
      description: 'Guided speaking practice for first conversations.',
      date: '2026-02-05',
      day: 2,
      created_at: '2026-01-25T08:05:00.000Z',
    },
  ],
  studentClasses: [
    { id: 1, student_id: 1, class_id: 1, created_at: '2026-02-01T08:00:00.000Z' },
    { id: 2, student_id: 2, class_id: 1, created_at: '2026-02-01T08:05:00.000Z' },
    { id: 3, student_id: 3, class_id: 2, created_at: '2026-03-01T08:00:00.000Z' },
  ],
  subjectGrades: [
    { id: 1, student_class_id: 1, subject_id: 1, score: 96, passed: true },
    { id: 2, student_class_id: 1, subject_id: 2, score: 94, passed: true },
    { id: 3, student_class_id: 2, subject_id: 1, score: 74, passed: true },
    { id: 4, student_class_id: 2, subject_id: 2, score: 52, passed: false },
    { id: 5, student_class_id: 3, subject_id: 1, score: 90, passed: true },
    { id: 6, student_class_id: 3, subject_id: 2, score: 88, passed: true },
    { id: 7, student_class_id: 3, subject_id: 3, score: 91, passed: true },
  ],
  resources: [
    {
      id: 1,
      title: 'A1 Grammar Workbook',
      description: 'Printable workbook for the first grammar module.',
      category: 'documents',
      type: 'document',
      visibility: 'all',
      url: 'https://example.com/a1-grammar-workbook.pdf',
      file_path: '',
      created_at: '2026-02-02T08:00:00.000Z',
    },
    {
      id: 2,
      title: 'Speaking Practice Prompts',
      description: 'Classroom prompt list for paired conversations.',
      category: 'templates',
      type: 'file',
      visibility: 'instructor',
      url: '',
      file_path: '/storage/resources/speaking-prompts.docx',
      created_at: '2026-02-08T08:00:00.000Z',
    },
  ],
  announcements: [
    {
      id: 1,
      title: 'Exam schedule published',
      body: 'Final exam dates for English A1 classes are now available for staff review.',
      target_type: 'class',
      target_id: 1,
      expires_at: '2026-07-15T08:00:00.000Z',
      created_by: 1,
      created_at: '2026-06-12T08:00:00.000Z',
    },
    {
      id: 2,
      title: 'New student orientation',
      body: 'Orientation for new IELTS Prep students will happen before the first evening session.',
      target_type: 'cycle',
      target_id: 2,
      expires_at: '2026-06-30T08:00:00.000Z',
      created_by: 2,
      created_at: '2026-06-10T08:00:00.000Z',
    },
    {
      id: 3,
      title: 'Certificate pickup reminder',
      body: 'Passed students from completed classes can collect certificates from the front desk.',
      target_type: 'all',
      target_id: null,
      expires_at: null,
      created_by: 1,
      created_at: '2026-06-08T08:00:00.000Z',
    },
  ],
  auditLogs: [
    { id: 1, action: 'CREATE', entity: 'Student', description: 'Sara Ahmadi registered.', created_at: '2026-02-03T08:00:00.000Z' },
    { id: 2, action: 'UPDATE', entity: 'Class', description: 'A1 Morning class schedule updated.', created_at: '2026-02-10T08:00:00.000Z' },
  ],
  subjectActivations: [
    { id: 1, class_id: 1, subject_id: 1, status: 'FINISHED', date_start: '2026-02-03', date_end: '2026-02-20' },
    { id: 2, class_id: 1, subject_id: 2, status: 'ACTIVE', date_start: '2026-02-22', date_end: null },
    { id: 3, class_id: 2, subject_id: 1, status: 'FINISHED', date_start: '2026-03-04', date_end: '2026-03-28' },
    { id: 4, class_id: 2, subject_id: 2, status: 'ACTIVE', date_start: '2026-04-01', date_end: null },
    { id: 5, class_id: 2, subject_id: 3, status: 'PENDING', date_start: null, date_end: null },
  ],
}

const endpointMap = {
  '/api/general': 'general',
  '/api/genders': 'genders',
  '/api/roles': 'roles',
  '/api/locations': 'locations',
  '/api/permissions': 'permissions',
  '/api/employee-permissions': 'employeePermissions',
  '/api/employees': 'employees',
  '/api/students': 'students',
  '/api/cycles': 'cycles',
  '/api/classes': 'classes',
  '/api/subjects': 'subjects',
  '/api/curriculums': 'curriculums',
  '/api/curriculum': 'curriculums',
  '/api/curriculum-entries': 'curriculumEntries',
  '/api/cycle-subjects': 'cycleSubjects',
  '/api/student-classes': 'studentClasses',
  '/api/subject-grades': 'subjectGrades',
  '/api/resources': 'resources',
  '/api/announcements': 'announcements',
  '/api/audit-logs': 'auditLogs',
}

let storeCache = null

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function loadStore() {
  if (storeCache) return storeCache
  if (!canUseStorage()) {
    storeCache = clone(seedData)
    return storeCache
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    storeCache = saved ? JSON.parse(saved) : clone(seedData)
  } catch {
    storeCache = clone(seedData)
  }
  return storeCache
}

function saveStore(store) {
  storeCache = store
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Demo mode should not fail when browser storage is unavailable.
  }
}

function nextId(rows) {
  return Math.max(0, ...rows.map((row) => Number(row.id) || 0)) + 1
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return value
  const number = Number(value)
  return Number.isNaN(number) ? value : number
}

function findById(rows, id) {
  return rows.find((row) => Number(row.id) === Number(id))
}

function getCollectionKey(pathname) {
  if (endpointMap[pathname]) return { key: endpointMap[pathname], id: null }
  for (const [basePath, key] of Object.entries(endpointMap)) {
    if (pathname.startsWith(`${basePath}/`)) {
      return { key, id: pathname.slice(basePath.length + 1).split('/')[0] }
    }
  }
  return { key: null, id: null }
}

function decorate(key, record, store) {
  if (!record) return record
  const row = { ...record }

  if (key === 'students') row.gender = findById(store.genders, row.gender_id)
  if (key === 'employees') {
    row.gender = findById(store.genders, row.gender_id)
    row.role = findById(store.roles, row.role_id)
  }
  if (key === 'classes') {
    row.cycle = findById(store.cycles, row.cycle_id)
    row.employee = findById(store.employees, row.employee_id)
    row.teacher = row.employee
    row.location = findById(store.locations, row.location_id)
  }
  if (key === 'curriculums') {
    row.cycle = findById(store.cycles, row.cycle_id)
    row.class = decorate('classes', findById(store.classes, row.class_id), store)
    row.employee = decorate('employees', findById(store.employees, row.employee_id), store)
  }
  if (key === 'curriculumEntries') row.subject = findById(store.subjects, row.subject_id)
  if (key === 'cycleSubjects') {
    row.cycle = findById(store.cycles, row.cycle_id)
    row.subject = findById(store.subjects, row.subject_id)
  }
  if (key === 'studentClasses') {
    row.student = decorate('students', findById(store.students, row.student_id), store)
    row.class = decorate('classes', findById(store.classes, row.class_id), store)
  }
  if (key === 'subjectGrades') row.subject = findById(store.subjects, row.subject_id)
  if (key === 'employeePermissions') {
    row.employee = decorate('employees', findById(store.employees, row.employee_id), store)
    row.permission = findById(store.permissions, row.permission_id)
  }
  if (key === 'announcements') {
    row.createdBy = decorate('employees', findById(store.employees, row.created_by), store)
  }

  return row
}

function applyFilters(rows, params) {
  let filtered = [...rows]

  for (const [key, rawValue] of Object.entries(params || {})) {
    if (['page', 'limit', '_limit', 'pageSize', 'orderBy'].includes(key)) continue
    if (rawValue === null || rawValue === undefined || rawValue === '') continue

    if (key === 'search') {
      const query = String(rawValue).toLowerCase()
      filtered = filtered.filter((row) => JSON.stringify(row).toLowerCase().includes(query))
      continue
    }

    filtered = filtered.filter((row) => String(row[key]) === String(rawValue))
  }

  return filtered
}

function sortRows(rows, orderBy) {
  if (!orderBy) return rows
  const [field, direction = 'asc'] = String(orderBy).split(':')
  return [...rows].sort((a, b) => {
    const left = a[field] ?? ''
    const right = b[field] ?? ''
    const value = String(left).localeCompare(String(right), undefined, { numeric: true })
    return direction === 'desc' ? -value : value
  })
}

function paginate(rows, params) {
  const rawLimit = params?.limit ?? params?._limit ?? params?.pageSize
  const limit = Number(rawLimit)
  if (!rawLimit || limit === 0) {
    return {
      rows,
      meta: { total: rows.length, page: 1, limit: rows.length, pages: 1 },
    }
  }

  const page = Math.max(1, Number(params?.page) || 1)
  const start = (page - 1) * limit
  const pages = Math.max(1, Math.ceil(rows.length / limit))
  return {
    rows: rows.slice(start, start + limit),
    meta: { total: rows.length, page, limit, pages },
  }
}

function listCollection(key, params, store) {
  const decorated = store[key].map((row) => decorate(key, row, store))
  const filtered = applyFilters(decorated, params)
  const sorted = sortRows(filtered, params?.orderBy)
  return paginate(sorted, params)
}

function buildOverview(store) {
  return store.classes.map((classRow) => {
    const cls = decorate('classes', classRow, store)
    const subjects = store.cycleSubjects
      .filter((item) => Number(item.cycle_id) === Number(classRow.cycle_id))
      .map((item) => {
        const activation = store.subjectActivations.find(
          (activationRow) =>
            Number(activationRow.class_id) === Number(classRow.id) &&
            Number(activationRow.subject_id) === Number(item.subject_id),
        )
        return {
          subject: findById(store.subjects, item.subject_id),
          activation,
          status: activation?.status ?? 'PENDING',
          date_start: activation?.date_start ?? null,
          date_end: activation?.date_end ?? null,
        }
      })
    return { class: cls, subjects }
  })
}

function makeCsv(rows) {
  if (!rows.length) return 'id\n'
  const keys = Object.keys(rows[0]).filter((key) => typeof rows[0][key] !== 'object')
  const lines = [keys.join(',')]
  for (const row of rows) {
    lines.push(keys.map((key) => JSON.stringify(row[key] ?? '')).join(','))
  }
  return lines.join('\n')
}

function makeBlob(data, type) {
  if (typeof Blob === 'undefined') return data
  return new Blob([data], { type })
}

function response(config, data, status = 200) {
  return Promise.resolve({
    data,
    status,
    statusText: status >= 400 ? 'Error' : 'OK',
    headers: {},
    config,
    request: {},
  })
}

function notFound(config, message = 'Demo endpoint not found.') {
  return Promise.reject({
    response: { status: 404, data: { message }, config },
    message,
    config,
  })
}

function parsePath(config) {
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://demo.local'
  const url = new URL(config.url, base)
  return url.pathname
}

function updateSubjectActivation(pathname, store) {
  const match = pathname.match(/^\/api\/subject-activations\/(\d+)\/(activate|deactivate|finish)$/)
  if (!match) return null

  const [, id, action] = match
  const row = findById(store.subjectActivations, id)
  if (!row) return null

  if (action === 'activate') {
    row.status = 'ACTIVE'
    row.date_start = row.date_start ?? new Date().toISOString().slice(0, 10)
    row.date_end = null
  }
  if (action === 'deactivate') {
    row.status = 'PENDING'
    row.date_end = null
  }
  if (action === 'finish') {
    row.status = 'FINISHED'
    row.date_end = new Date().toISOString().slice(0, 10)
  }

  saveStore(store)
  return row
}

function normalizePayload(payload) {
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload)
    } catch {
      payload = {}
    }
  }

  const next = { ...payload }
  for (const field of Object.keys(next)) {
    if (field.endsWith('_id')) next[field] = toNumber(next[field])
  }
  return next
}

export function isDemoApiEnabled() {
  return import.meta.env.VITE_USE_MOCK_API !== 'false' && !import.meta.env.VITE_API_URL
}

export async function demoAdapter(config) {
  const store = loadStore()
  const method = (config.method || 'get').toLowerCase()
  const pathname = parsePath(config)
  const params = config.params || {}

  if (pathname === '/api/overview' && method === 'get') {
    return response(config, { data: buildOverview(store) })
  }

  if (pathname.startsWith('/api/subject-activations/') && method === 'patch') {
    const row = updateSubjectActivation(pathname, store)
    if (!row) return notFound(config)
    return response(config, { data: row })
  }

  if (pathname === '/api/settings/change-password' && method === 'post') {
    return response(config, { data: { ok: true }, message: 'Password changed in demo mode.' })
  }

  if (pathname.startsWith('/api/settings/export/') && method === 'get') {
    const type = pathname.split('/').pop()
    const key = type === 'enrollments' ? 'studentClasses' : type
    const rows = store[key] || []
    return response(config, makeBlob(makeCsv(rows), 'text/csv;charset=utf-8;'))
  }

  const { key, id } = getCollectionKey(pathname)
  if (!key || !store[key]) return notFound(config)

  if (method === 'get') {
    if (id) {
      const record = findById(store[key], id)
      if (!record) return notFound(config, 'Demo record not found.')
      return response(config, { data: decorate(key, record, store) })
    }

    const result = listCollection(key, params, store)
    return response(config, { data: result.rows, meta: result.meta })
  }

  if (method === 'post') {
    const row = {
      id: nextId(store[key]),
      ...normalizePayload(config.data || {}),
      created_at: new Date().toISOString(),
    }
    if (key === 'students' && !row.usid) row.usid = `STD-${1000 + row.id}`
    store[key].push(row)
    saveStore(store)
    return response(config, { data: decorate(key, row, store) }, 201)
  }

  if (method === 'patch' || method === 'put') {
    const row = findById(store[key], id)
    if (!row) return notFound(config, 'Demo record not found.')
    Object.assign(row, normalizePayload(config.data || {}))
    saveStore(store)
    return response(config, { data: decorate(key, row, store) })
  }

  if (method === 'delete') {
    const index = store[key].findIndex((row) => Number(row.id) === Number(id))
    if (index === -1) return notFound(config, 'Demo record not found.')
    store[key].splice(index, 1)
    saveStore(store)
    return response(config, { data: { id: toNumber(id), deleted: true } })
  }

  return notFound(config)
}
