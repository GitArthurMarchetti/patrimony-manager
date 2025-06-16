import type { NextConfig } from "next";

const NEXT_PUBLIC_BACKEND_URL_DEV = 'http://localhost:8080'; 

const nextConfig: NextConfig = {

  async rewrites() {
    let backendDestinationUrl: string;

    if (process.env.NODE_ENV === 'development') {
      backendDestinationUrl = NEXT_PUBLIC_BACKEND_URL_DEV;
    } else {
      if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
        console.error("ERRO: NEXT_PUBLIC_API_BASE_URL não está definida no ambiente de produção. As requisições API podem falhar.");
        backendDestinationUrl = '';
      } else {
        backendDestinationUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      }
    }

    return [
      {
        source: '/api/:path*', 
        destination: `${backendDestinationUrl}/api/:path*`, 
      },
    ];
  },
};

export default nextConfig;