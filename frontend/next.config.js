// const apiUrl = process.env.LLM_API_URL || "http://localhost:8080";

const config = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  output: "standalone",
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/llm/:path*",
  //       destination: `${apiUrl}/:path*`,
  //     },
  //   ];
  // },
};
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
module.exports = withBundleAnalyzer(config);
