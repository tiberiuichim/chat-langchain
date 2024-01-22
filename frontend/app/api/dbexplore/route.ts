import { NextResponse } from "next/server";
import weaviate from "weaviate-ts-client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const server = process.env.WEAVIATE_URL || "http://localhost:8060";
  let body = {
    index: process.env.WEAVIATE_DOCS_INDEX_NAME,
    pageSize: 10,
    page: 1,
  };
  try {
    body = await req.json();
  } catch {
    //
  }

  const index = body.index || process.env.WEAVIATE_DOCS_INDEX_NAME || "";
  const pageSize = body.pageSize || 10;
  const page = body.page || 1;
  const offset = (page - 1) * pageSize;

  const url = new URL(server);
  const options = {
    scheme: url.protocol.replaceAll("://", "").replaceAll(":", ""),
    host: `${url.hostname}:${url.port}`, // Replace with your endpoint
  };

  const client = weaviate.client(options);
  let response = await client.schema.getter().do();

  if (index) {
    const extra = await client.graphql
      .get()
      .withClassName(index)
      .withFields(["title", "text", "source", "page", "file_path"].join(" "))
      .withLimit(pageSize)
      .withOffset(offset)
      .do();
    const count = await client.graphql
      .aggregate()
      .withClassName(index)
      .withFields("meta {count}")
      .do();
    response = { ...extra.data, ...count.data };
  }

  return NextResponse.json(response);
}
