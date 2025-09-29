export default function Home() {
  return (
    <section className="text-center">
      <h1 className="text-3xl font-semibold mb-2">Apple‑Inspired On‑Call Dashboard</h1>
      <p className="soft max-w-2xl mx-auto">
        Browse your on‑call schedule, filter by columns, open per‑person insights, and chat with the in‑app tour guide.
      </p>
      <div className="mt-6">
        <a className="btn btn-primary" href="/dashboard">Open Dashboard</a>
      </div>
    </section>
  );
}
