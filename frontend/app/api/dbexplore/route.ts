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

  if (!body.index) {
    response = await client.schema.getter().do();
  } else {
    response = await client.graphql
      .get()
      .withClassName(body.index)
      .withFields(["title", "text", "source", "page", "file_path"].join(" "))
      .withLimit(10)
      .do();
    const count = await client.graphql
      .aggregate()
      .withClassName(body.index)
      .withFields("meta {count}")
      .do();
    response = { ...response.data, ...count.data };
  }

  return NextResponse.json(response);
}
