import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const backend = `${process.env.API_URL}/files/`;
  const response = await fetch(backend, req);

  if (!response.ok) {
    return NextResponse.json(
      { error: "An error occurred in backend communication" },
      { status: response.status },
    );
  }

  return new Response(response.body, {
    headers: {
      "content-type": "text/event-stream",
    },
  });
}
