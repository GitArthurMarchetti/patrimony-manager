import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* outras opções de configuração aqui (se houver) */
  async rewrites() {
    return [
      {
        source: '/api/(.*)', // Captura tudo depois de /api/
        // ATENÇÃO: COLOQUE A URL COMPLETA DO SEU BACKEND NA AWS AQUI
        destination: 'http://gestao-patrimonio-backend-env.us-east-2.elasticbeanstalk.com/api/$1',
        // **REMOVA ESTA LINHA:**
        // permanent: false,
      },
    ];
  },
};

export default nextConfig;