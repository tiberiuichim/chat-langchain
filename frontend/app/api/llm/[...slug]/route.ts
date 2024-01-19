import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string | string[] } },
) {
  let { slug } = params;
  if (Array.isArray(slug)) {
    slug = slug.join("/");
  }
  const backend = `${process.env.API_URL}/${slug}`;
  // console.log("backend", backend);
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
