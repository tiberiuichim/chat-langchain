import { createProxyMiddleware } from "http-proxy-middleware";
import type { NextApiRequest, NextApiResponse } from "next";

const proxy = createProxyMiddleware({
  target: process.env.API_URL,
  changeOrigin: true, // if you are changing the host
  pathRewrite: {
    "^/api/internal": "", // remove the /api/internal prefix
  },
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxy(req, res);
}
