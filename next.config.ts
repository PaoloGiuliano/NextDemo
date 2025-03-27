import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["tsvabqmdcirbjnxq.s3.us-east-1.amazonaws.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tsvabqmdcirbjnxq.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/**", //allow any path
      },
    ],
  },
};

export default nextConfig;
