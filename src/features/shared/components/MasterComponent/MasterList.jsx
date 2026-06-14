// ─────────────────────────────────────────────────────────────────────────────
// MasterList.jsx
//
// Renders the List tab: search bar, filter bar, data table, pagination.
// Everything is driven by the config object.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Pencil,
  Loader2,
  AlertCircle,
  X,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
} from "lucide-react";
import { cn } from "../../../../utils/utils";
import { getNestedValue } from "../../../../utils/utils";
import api from "../../../../utils/api";

// ── Filter bar ────────────────────────────────────────────────────────────────

function FilterBar({ filters, activeFilters, onChange, isDark }) {
  if (!filters?.length) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {filters.map((filter) => {
        const [options, setOptions] = useState(filter.options ?? []);
        const [loading, setLoading] = useState(false);

        useEffect(() => {
          if (!filter.fetchOptions) return;
          setLoading(true);
          api
            .get(filter.fetchOptions.url, { params: { limit: 0 } })
            .then((res) => {
              const raw = res.data?.data ?? [];
              setOptions(
                raw.map((item) => ({
                  value: item[filter.fetchOptions.valueKey ?? "id"],
                  label:
                    typeof filter.fetchOptions.labelKey === "function"
                      ? filter.fetchOptions.labelKey(item)
                      : (item[filter.fetchOptions.labelKey ?? "name"] ??
                        item.id),
                })),
              );
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        }, []); // eslint-disable-line react-hooks/exhaustive-deps

        const current = activeFilters[filter.key] ?? "";

        return (
          <div key={filter.key} className="relative w-full sm:w-auto">
            <select
              value={current}
              onChange={(e) => onChange(filter.key, e.target.value || null)}
              disabled={loading}
              className={cn(
                "appearance-none pr-7 pl-3 py-2 rounded-md text-xs font-medium border-2 outline-none",
                "transition-all duration-200 cursor-pointer w-full min-w-[130px] sm:w-auto",
                current
                  ? "border-primary text-primary bg-primary-50"
                  : isDark
                    ? "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600"
                    : "border-border bg-white text-gray-600 hover:border-gray-300",
              )}
            >
              <option value="">{filter.label}</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              {loading ? (
                <Loader2
                  size={11}
                  className="animate-spin text-muted-foreground"
                />
              ) : (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Table cell renderer ───────────────────────────────────────────────────────

function CellValue({ column, row }) {
  const raw = getNestedValue(row, column.key);

  if (column.render) return column.render(raw, row);

  if (raw === null || raw === undefined || raw === "") {
    return <span className="text-muted-foreground opacity-40">—</span>;
  }

  if (typeof raw === "boolean") {
    return (
      <span className={cn("badge", raw ? "badge-green" : "badge-gray")}>
        {raw ? "Yes" : "No"}
      </span>
    );
  }

  return <span>{String(raw)}</span>;
}

// ── MasterList ────────────────────────────────────────────────────────────────

/**
 * MasterList
 *
 * Props:
 *   config        {object}   MasterComponent config
 *   isDark        {boolean}
 *   onEdit        {function} (record) => void — switches to Edit tab
 */
export default function MasterList({ config, isDark, onEdit }) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState(config.defaultOrderBy ?? null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const searchRef = useRef(null);
  const searchTimeout = useRef(null);

  const limit = config.pageSize ?? 15;

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const fetchData = useCallback(
    async (opts = {}) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: opts.page ?? page,
          limit,
          ...(search && { search }),
          ...filters,
          ...(orderBy && { orderBy }),
          ...(config.defaultParams ?? {}),
        };
        // Remove null/undefined filter values
        for (const k of Object.keys(params)) {
          if (params[k] === null || params[k] === undefined || params[k] === "")
            delete params[k];
        }

        const res = await api.get(config.apiPath, { params });
        setData(res.data?.data ?? []);
        setMeta(res.data?.meta ?? { total: 0, page: 1, limit, pages: 1 });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [page, search, filters, orderBy, config.apiPath, limit],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch on mount and when deps change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounced search
  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleFilterChange = (key, val) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (val === null || val === undefined || val === "") delete next[key];
      else next[key] = val;
      return next;
    });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearch("");
    setPage(1);
  };

  const toggleSort = (col) => {
    if (!col.sortable) return;
    const key = col.sortKey ?? col.key;
    const [currentField, currentDir] = (orderBy ?? ":").split(":");
    if (currentField === key) {
      setOrderBy(currentDir === "asc" ? `${key}:desc` : `${key}:asc`);
    } else {
      setOrderBy(`${key}:asc`);
    }
    setPage(1);
  };

  const SortIcon = ({ col }) => {
    if (!col.sortable) return null;
    const key = col.sortKey ?? col.key;
    const [currentField, currentDir] = (orderBy ?? ":").split(":");
    const isActive = currentField === key;

    return (
      <span className="ml-1 inline-flex flex-col gap-0">
        <ChevronUp
          size={9}
          className={cn(
            isActive && currentDir === "asc"
              ? "text-primary"
              : "text-gray-400 opacity-50",
          )}
        />
        <ChevronDownIcon
          size={9}
          className={cn(
            isActive && currentDir === "desc"
              ? "text-primary"
              : "text-gray-400 opacity-50",
          )}
        />
      </span>
    );
  };

  const columns = config.columns ?? []
  const hasFilters = config.filters?.length > 0
  const normalizedError = error?.includes('status code 404')
    ? `${config.entityName ?? 'Records'} service is currently unavailable (404).`
    : error

  // Expose refresh so MasterComponent can trigger it
  if (config._listRef) config._listRef.current = { refresh: fetchData };

  const totalColumns = columns.length + (config.hideActions ? 0 : 1); 

  return (
    <div className="space-y-4 relative z-10">
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          {config.searchable !== false && (
            <div className="relative w-full flex-1 sm:max-w-sm">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                ref={searchRef}
                type="text"
                placeholder={config.searchPlaceholder ?? "Search…"}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={cn(
                  "w-full pl-9 pr-9 py-2.5 rounded-md text-sm border-2 outline-none transition-all duration-200",
                  isDark
                    ? "bg-gray-800 text-gray-100 placeholder-gray-500 border-gray-700 focus:border-primary"
                    : "bg-muted text-foreground placeholder-gray-400 border-transparent focus:border-primary focus:bg-white",
                )}
              />
              {search && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Filter toggle */}
          {hasFilters && (
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={cn(
                "flex w-full items-center justify-center gap-2 px-3 py-2.5 rounded-md text-xs font-semibold border-2 transition-all duration-200 sm:w-auto",
                filtersOpen || activeFilterCount > 0
                  ? "border-primary bg-primary-50 text-primary"
                  : isDark
                    ? "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600"
                    : "border-border bg-white text-gray-600 hover:border-gray-300",
              )}
            >
              <SlidersHorizontal size={13} />
              Filters
              {activeFilterCount > 0 && (
                <span className="badge badge-blue text-[10px] px-1.5 py-0">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          {/* Clear all */}
          {(activeFilterCount > 0 || search) && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors sm:whitespace-nowrap"
            >
              Clear all
            </button>
          )}

          {/* Meta count */}
          <span className="text-xs text-muted-foreground whitespace-nowrap sm:ml-auto">
            {meta.total} {config.entityName ?? "records"}
            {meta.total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Filter bar */}
        {filtersOpen && hasFilters && (
          <div
            className={cn(
              "p-3 rounded-md border-2 animate-slide-in-up",
              isDark
                ? "bg-gray-800/60 border-gray-700"
                : "bg-muted/50 border-border",
            )}
          >
            <FilterBar
              filters={config.filters}
              activeFilters={filters}
              onChange={handleFilterChange}
              isDark={isDark}
            />
          </div>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "rounded-lg overflow-hidden border",
          isDark ? "border-gray-800" : "border-border",
        )}
      >
        {/* Error state */}
        {error && (
          <div
            className={cn(
              "flex items-start gap-2 px-3 py-3 text-sm sm:items-center sm:px-4",
              isDark ? "bg-red-950/40 text-red-400" : "bg-red-50 text-red-700",
            )}
          >
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className={cn('data-table min-w-[720px]', isDark && 'data-table-dark')}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col)}
                    style={{ width: col.width }}
                    className={cn(
                    "sticky top-0 z-20",
                    isDark ? "bg-gray-900" : "bg-white",
                    col.sortable && "cursor-pointer select-none hover:text-foreground transition-colors",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    )}
                  >
                    <span className="inline-flex items-center">
                      {col.label}
                      <SortIcon col={col} />
                    </span>
                  </th>
                ))}
                {/* Edit action column – conditionally rendered */}
                {!config.hideActions && <th className="w-12" />}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={totalColumns}
                    className="text-center py-12"
                  >
                    <Loader2
                      size={22}
                      className="animate-spin mx-auto text-muted-foreground"
                    />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={totalColumns}
                    className="text-center py-12"
                  >
                    <p className="text-sm text-muted-foreground">
                      {search || activeFilterCount > 0
                        ? "No results match your search."
                        : (config.emptyMessage ?? "No records yet.")}
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr
                    key={row.id ?? i}
                    className={cn(
                      isDark &&
                        "bg-gray-900 hover:bg-gray-800 border-b border-gray-800 last:border-0",
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          col.align === "right" && "text-right",
                          col.align === "center" && "text-center",
                          col.className,
                        )}
                      >
                        <CellValue column={col} row={row} />
                      </td>
                    ))}
                    {/* Edit button – conditionally rendered */}
                    {!config.hideActions && (
                      <td className="text-right">
                        <button
                          onClick={() => onEdit(row)}
                          title={`Edit ${config.entityName ?? "record"}`}
                          className={cn(
                            "inline-flex items-center justify-center w-7 h-7 rounded-md",
                            "transition-all duration-200 hover:scale-110",
                            isDark
                              ? "text-gray-500 hover:bg-gray-700 hover:text-primary-300"
                              : "text-muted-foreground hover:bg-primary-50 hover:text-primary-600",
                          )}
                        >
                          <Pencil size={13} strokeWidth={2} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {meta.pages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Page {meta.page} of {meta.pages}
          </p>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.page <= 1 || loading}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-md border-2 transition-all duration-200",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                isDark
                  ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                  : "border-border text-gray-600 hover:border-primary hover:text-primary",
              )}
            >
              <ChevronLeft size={14} />
            </button>

            {/* Page numbers — show max 5 */}
            {Array.from({ length: Math.min(meta.pages, 5) }, (_, i) => {
              let p;
              if (meta.pages <= 5) {
                p = i + 1;
              } else if (meta.page <= 3) {
                p = i + 1;
              } else if (meta.page >= meta.pages - 2) {
                p = meta.pages - 4 + i;
              } else {
                p = meta.page - 2 + i;
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  disabled={loading}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-md text-xs font-semibold border-2 transition-all duration-200",
                    p === meta.page
                      ? "border-primary bg-primary text-white"
                      : isDark
                        ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                        : "border-border text-gray-600 hover:border-primary hover:text-primary",
                  )}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
              disabled={meta.page >= meta.pages || loading}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-md border-2 transition-all duration-200",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                isDark
                  ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                  : "border-border text-gray-600 hover:border-primary hover:text-primary",
              )}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
