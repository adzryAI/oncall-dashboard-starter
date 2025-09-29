"use client";

import { useEffect, useMemo } from "react";

type Row = Record<string, string>;

function parseDateMaybe(v: string) {
  if (!v) return null;
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(v)) {
    const [d, m, y] = v.split('/').map(Number);
    return new Date(y < 100 ? 2000 + y : y, m - 1, d);
  }
  const t = Date.parse(v);
  return isNaN(t) ? null : new Date(t);
}

function groupBy<T>(arr: T[], fn: (x: T) => string) {
  return arr.reduce((m: Record<string, T[]>, x) => {
    const k = fn(x); (m[k] ||= []).push(x); return m;
  }, {} as Record<string, T[]>);
}

function weekKey(d: Date) {
  const dt = new Date(d); const tmp = new Date(dt);
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const week1 = new Date(tmp.getFullYear(), 0, 4);
  const weekNo = 1 + Math.round(((tmp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${tmp.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export default function Insights({ open, onClose, person, rows, headers, nameCol }:
  { open: boolean, onClose: () => void, person: string | null, rows: Row[], headers: string[], nameCol: string }) {

  const myRows = useMemo(() => rows.filter(r => (r[nameCol] || "") === (person || "")), [rows, person, nameCol]);
  const stats = useMemo(() => {
    const total = myRows.length;
    const dateCol = headers.find(h => /tarikh|date/i.test(h)) ?? headers[1];
    const shiftCol = headers.find(h => /shift|syif|oncall|giliran/i.test(h));
    const locCol = headers.find(h => /lokasi|location|ward|unit/i.test(h));

    const byShift = groupBy(myRows, r => (shiftCol ? r[shiftCol] : "Unknown") || "Unknown");
    const byLoc = groupBy(myRows, r => (locCol ? r[locCol] : "Unknown") || "Unknown");
    const byDow = groupBy(myRows, r => {
      const d = parseDateMaybe(dateCol ? r[dateCol] : ""); return d ? ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()] : "Unknown";
    });
    const byMonth = groupBy(myRows, r => {
      const d = parseDateMaybe(dateCol ? r[dateCol] : ""); return d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}` : "Unknown";
    });
    const byWeek = groupBy(myRows, r => {
      const d = parseDateMaybe(dateCol ? r[dateCol] : ""); return d ? weekKey(d) : "Unknown";
    });

    const dates = myRows.map(r => parseDateMaybe(dateCol ? r[dateCol] : "")).filter(Boolean).sort((a: any, b: any) => +a - +b) as Date[];
    let maxStreak = 0, cur = 0, prev: Date | null = null;
    dates.forEach(d => { if (prev && (+d - +prev === 86400000)) cur++; else cur = 1; if (cur > maxStreak) maxStreak = cur; prev = d; });

    const weeks = Object.keys(byWeek).filter(k => k !== "Unknown").length;
    const avgPerWeek = weeks ? (total / weeks) : total;

    function topKey(map: Record<string, any[]>) {
      let best: string | null = null, bestCount = -1;
      for (const k in map) { const c = map[k].length; if (c > bestCount && k !== "Unknown") { best = k; bestCount = c; } }
      return best || "—";
    }

    return {
      total, byShift, byLoc, byDow, byMonth, byWeek, maxStreak,
      busiestMonth: topKey(byMonth), busiestDow: topKey(byDow), topShift: topKey(byShift), avgPerWeek
    };
  }, [myRows, headers]);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  function Pill({ label, value }: { label: string, value: string }) {
    return <span className="badge mr-2 mb-2">{label}: <b className="ml-1">{value}</b></span>;
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
      <div className="w-full sm:w-[420px] bg-white h-full shadow-xl border-l p-5 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Insights — {person}</h3>
          <button className="btn btn-outline px-3 py-1" onClick={onClose}>Close</button>
        </div>

        <div className="mb-3">
          <Pill label="Total" value={String(stats.total)} />
          <Pill label="Avg/Week" value={stats.avgPerWeek.toFixed(2)} />
          <Pill label="Longest Streak" value={String(stats.maxStreak)} />
        </div>

        <div className="mb-4">
          <div className="mb-1 font-medium">Shift Mix</div>
          <div>{Object.entries(stats.byShift).map(([k, v]) => <Pill key={k} label={k} value={String((v as any[]).length)} />)}</div>
        </div>

        <div className="mb-4">
          <div className="mb-1 font-medium">Days</div>
          <div>{Object.entries(stats.byDow).map(([k, v]) => <Pill key={k} label={k} value={String((v as any[]).length)} />)}</div>
        </div>

        <div className="mb-4">
          <div className="mb-1 font-medium">Locations</div>
          <div>{Object.entries(stats.byLoc).map(([k, v]) => <Pill key={k} label={k} value={String((v as any[]).length)} />)}</div>
        </div>

        <div>
          <div className="mb-1 font-medium">Narrative</div>
          <p>
            <b>{person}</b> handled <b>{stats.total}</b> sessions ({stats.avgPerWeek.toFixed(2)}/week).
            Peak in <b>{stats.busiestMonth}</b>, mostly on <b>{stats.busiestDow}</b>, shift <b>{stats.topShift}</b>.
            Keep loads factual; avoid guesses.
          </p>
          <ul className="list-disc pl-5 mt-2">
            {stats.topShift !== "—" && <li>Consider rotating some <b>{stats.topShift}</b> shifts for balance.</li>}
            {stats.busiestDow !== "—" && <li>Cross-level <b>{stats.busiestDow}</b> coverage to reduce spikes.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
