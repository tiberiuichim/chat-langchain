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

  const server = process.env.WEAVIATE_URL;
  const index = process.env.WEAVIATE_DOCS_INDEX_NAME;

  // const backend = `${}/${slug}`;
  // console.log("backend", backend);
  // const response = await fetch(backend, req);

  if (!response.ok) {
    return NextResponse.json(
      { error: "An error occurred in backend communication" },
      { status: response.status },
    );
  }
  console.log("headers", response.headers);

  return new Response(response.body, {
    headers: response.headers,
  });
}
