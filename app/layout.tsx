import "./globals.css";

export const metadata = {
  title: "On‑Call Dashboard",
  description: "Production-ready on-call schedule dashboard with chat pilot"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="w-full border-b border-neutral-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
            <div className="font-semibold">On‑Call Dashboard</div>
            <div className="flex gap-2">
              <a className="btn btn-outline" href="/dashboard">Dashboard</a>
              <a className="btn btn-primary" href="/dashboard#pilot">Ask the Pilot</a>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        <footer className="border-t border-neutral-200 text-sm text-neutral-500 py-8 text-center">
          © 2025 On‑Call Dashboard • React/Next.js Starter
        </footer>
      </body>
    </html>
  );
}
