import { NextResponse } from "next/server";
import weaviate from "weaviate-ts-client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const server = process.env.WEAVIATE_URL || "http://localhost:8060";
  let body = {
    index: null,
  };
  try {
    body = await req.json();
  } catch {
    //
  }

  // const index = process.env.WEAVIATE_DOCS_INDEX_NAME || "";

  const url = new URL(server);
  const options = {
    scheme: url.protocol.replaceAll("://", "").replaceAll(":", ""),
    host: `${url.hostname}:${url.port}`, // Replace with your endpoint
  };

  const client = weaviate.client(options);
  let response;

  if (body.index) {
    response = await client.graphql
      .get()
      .withClassName(body.index)
      .withFields(["title", "text", "source", "page"].join(" "))
      .withLimit(10)
      .do();
  } else {
    response = await client.schema.getter().do();
  }

  return NextResponse.json(response);
}
