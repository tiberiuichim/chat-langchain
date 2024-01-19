import { NextRequest, NextResponse } from "next/server";
import weaviate from "weaviate-ts-client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const server = process.env.WEAVIATE_URL || "http://localhost:8060";
  // const index = process.env.WEAVIATE_DOCS_INDEX_NAME || "";

  const url = new URL(server);
  const options = {
    scheme: url.protocol.replaceAll("://", "").replaceAll(":", ""),
    host: `${url.hostname}:${url.port}`, // Replace with your endpoint
  };
  console.log("options", options);

  const client = weaviate.client(options);

  // const allClassDefinitions = await client.schema.get();

  // console.log(JSON.stringify(allClassDefinitions, null, 2));

  const response = await client.schema.getter().do();
  // console.log("response", response);

  // if (!response.ok) {
  //   return NextResponse.json(
  //     { error: "An error occurred in backend communication" },
  //     { status: response.status },
  //   );
  // }
  // console.log("headers", response.headers);

  return NextResponse.json({ indexes: response });

  // (response.body, {
  //   headers: response.headers,
  // });
}
