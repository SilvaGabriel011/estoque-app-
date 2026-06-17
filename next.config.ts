import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Keep recently visited pages in the client router cache so navigating
    // back to a section is instant instead of re-fetching from the server.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
