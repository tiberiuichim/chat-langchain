import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function generic_handler(req: NextRequest) {
  const backend = `${process.env.API_URL}/settings`;
  console.log("backend", backend);
  const response = await fetch(backend, req);

  if (!response.ok) {
    return NextResponse.json(
      { error: "An error occurred in backend communication" },
      { status: response.status },
    );
  }

  return new Response(response.body, {
    headers: response.headers,
  });
}

export async function POST(req: NextRequest) {
  return await generic_handler(req);
}

export async function GET(req: NextRequest) {
  return await generic_handler(req);
}
