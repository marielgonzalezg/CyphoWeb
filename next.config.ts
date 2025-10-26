import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
  domains: ['www.google.com', 'banorte.com'],
  remotePatterns: [new URL("https://quierocredito.mx/wp-content/uploads/2019/04/Tarjetas-Banorte-02.png")],
  },
};

export default nextConfig;
