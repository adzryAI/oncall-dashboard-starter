import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const res = await fetch(process.env.CHAT_ENDPOINT!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ reply: "⚠️ Unable to reach CHAT_ENDPOINT. Check .env.local" });
  }
}
