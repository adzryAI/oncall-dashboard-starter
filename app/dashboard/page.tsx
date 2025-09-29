"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSheet } from "@/lib/sheets";
import { APP_CONFIG } from "@/lib/config";
import Chatbox from "@/components/Chatbox";
import Insights from "@/components/Insights";

type Row = Record<string, string>;

function normalizeHeaderNames(names: string[]) {
  return names.map((n, i) => (n?.trim() || `Column ${i + 1}`));
}

function applyColumnOrder(cols: string[]) {
  const pref = APP_CONFIG.COLUMN_ORDER;
  if (!pref.length) return cols.filter(c => !APP_CONFIG.HIDE_COLUMNS.includes(c));
  const set = new Set(pref);
  const rest = cols.filter(c => !set.has(c));
  return [...pref.filter(c => cols.includes(c)), ...rest].filter(c => !APP_CONFIG.HIDE_COLUMNS.includes(c));
}

export default function Dashboard() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [visible, setVisible] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, Set<string>>>({});
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { cols, rows } = await fetchSheet(APP_CONFIG.SHEET_ID, APP_CONFIG.GID);
      const normalized = normalizeHeaderNames(cols);
      setHeaders(applyColumnOrder(normalized));
      const objs: Row[] = rows.map((r: any[]) => Object.fromEntries(normalized.map((c, i) => [c, (r[i] ?? "").toString().trim()])));
      setRows(objs);
      setVisible(objs);
    })();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    const out = rows.filter(r => {
      const passSearch = !q || headers.some(h => (r[h] + "").toLowerCase().includes(q));
      if (!passSearch) return false;
      for (const [col, set] of Object.entries(filters)) {
        if (!set.size) continue;
        if (!set.has(r[col] ?? "")) return false;
      }
      return true;
    });
    setVisible(out);
  }, [search, filters, rows, headers]);

  const nameCol = useMemo(() => headers.find(h => /nama|name|pegawai|staff/i.test(h)) ?? headers[0], [headers]);

  const columnOptions = headers.map(h => <option key={h}>{h}</option>);

  const [filterCol, setFilterCol] = useState<string>("");
  const [filterVals, setFilterVals] = useState<string[]>([]);

  const uniqueVals = useMemo(() => {
    if (!filterCol) return [];
    return Array.from(new Set(rows.map(r => (r[filterCol] ?? "")))).filter(Boolean).sort();
  }, [filterCol, rows]);

  return (
    <div id="pilot">
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex gap-2 items-center">
          <input className="input w-full" placeholder="Search…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 items-center">
          <select className="input" value={filterCol} onChange={e => setFilterCol(e.target.value)}>
            <option value="">Filter column…</option>
            {columnOptions}
          </select>
          <select multiple className="input w-full" onChange={e => {
            const opts = Array.from(e.target.selectedOptions).map(o => o.value);
            setFilterVals(opts);
          }}>
            {uniqueVals.map(v => <option key={v}>{v}</option>)}
          </select>
          <button className="btn btn-outline" onClick={() => {
            if (!filterCol || !filterVals.length) return;
            setFilters(prev => ({ ...prev, [filterCol]: new Set([...(prev[filterCol] ?? []), ...filterVals]) }));
          }}>Add</button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {Object.entries(filters).map(([col, set]) =>
          Array.from(set).map(v => (
            <span className="badge" key={col + v}
              onClick={() => {
                setFilters(prev => {
                  const s = new Set(prev[col]); s.delete(v);
                  const n = { ...prev }; if (s.size) n[col] = s; else delete n[col];
                  return n;
                });
              }}>{col}: {v} ×</span>
          ))
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: "70vh" }}>
          <table className="min-w-full">
            <thead className="sticky top-0 bg-white">
              <tr>
                {headers.map(h => <th key={h} className="text-left text-xs uppercase tracking-wide text-neutral-500 px-4 py-3 border-b">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {visible.map((r, idx) => (
                <tr key={idx} className="hover:bg-neutral-50">
                  {headers.map(h => (
                    <td key={h} className="px-4 py-2 border-b">
                      {h === nameCol
                        ? <button className="text-blue-600 hover:underline" onClick={() => setSelectedPerson(r[h])}>{r[h]}</button>
                        : r[h]}
                    </td>
                  ))}
                </tr>
              ))}
              {!visible.length && (
                <tr><td className="px-4 py-8 text-center soft" colSpan={headers.length}>No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Insights
        open={!!selectedPerson}
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        rows={rows}
        headers={headers}
        nameCol={nameCol}
      />

      <Chatbox getContext={() => ({
        search,
        filters: Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, Array.from(v)])),
        columns: headers,
        sample: visible.slice(0, 20)
      })} />
    </div>
  );
}
