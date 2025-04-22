import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tsvabqmdcirbjnxq.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/**", //allow any path
      },
      {
        protocol: "https",
        hostname: "files.us.fieldwire.com",
        port: "",
        pathname: "/**", //allow any path
      },
      {
        protocol: "https",
        hostname: "d28ji4sm1vmprj.cloudfront.net",
        port: "",
        pathname: "/**", //allow any path
      },
    ],
  },
};

export default nextConfig;
