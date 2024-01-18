import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const backend = `${process.env.API_URL}/files/`;
  console.log("upload", req);

  try {
    const resp = await fetch(backend, req);
    console.log("resp", resp);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.log("error", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
