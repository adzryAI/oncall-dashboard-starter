export async function fetchSheet(sheetId: string, gid: string) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  const json = JSON.parse(text.replace(/^[^\{]+/, "").replace(/;\s*$/, ""));
  const cols: string[] = json.table.cols.map((c: any) => c.label || c.id || "");
  const rows: string[][] = json.table.rows.map((r: any) => (r.c || []).map((c: any) => c ? (c.f ?? c.v) : ""));
  return { cols, rows };
}
