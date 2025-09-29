"use client";

import { useState } from "react";

type ChatMessage = { role: "user" | "assistant", content: string };

export default function Chatbox({ getContext }: { getContext: () => any }) {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I’m your On‑Call Pilot. Ask me about filters, people, or exports." }
  ]);
  const [input, setInput] = useState("");

  async function send() {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    const payload = {
      userId: "local-demo",
      messages: [{ role: "user", content: input }],
      context: getContext()
    };

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    const reply = data.reply || "⚠️ No reply (check CHAT_ENDPOINT)";
    setMessages(prev => [...prev, { role: "assistant", content: reply }]);
  }

  return (
    <div className="fixed right-6 bottom-6 w-96">
      <div className="card">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-medium">Tour Guide & Pilot</div>
          <button className="btn btn-outline px-3 py-1" onClick={() => setOpen(!open)}>{open ? "–" : "+"}</button>
        </div>
        {open && (
          <div className="p-3">
            <div className="h-64 overflow-auto border rounded-lg p-2 bg-neutral-50">
              {messages.map((m, i) => (
                <div key={i} className={`mb-2 ${m.role === "user" ? "text-right" : "text-left"}`}>
                  <div className={`inline-block px-3 py-2 rounded-lg ${m.role === "user" ? "bg-blue-600 text-white" : "bg-white border"}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input className="input flex-1" placeholder="Ask the pilot…"
                value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                }} />
              <button className="btn btn-primary" onClick={send}>Send</button>
            </div>
            <p className="soft text-xs mt-2">No hallucinations: the pilot uses only the visible data + your context.</p>
          </div>
        )}
      </div>
    </div>
  );
}
