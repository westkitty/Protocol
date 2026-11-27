import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  outputFileTracingRoot: path.join(__dirname),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
