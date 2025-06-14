import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* outras opções de configuração aqui (se houver) */
  async rewrites() {
    return [
      {
        source: '/api/(.*)', // Captura TUDO depois de /api/, ex: /auth/register
        // ATENÇÃO: COLOQUE A URL COMPLETA DO SEU BACKEND NA AWS AQUI
        // O '$1' passará tudo o que foi capturado pelo '(.*)'
        destination: 'http://gestao-patrimonio-backend-env.us-east-2.elasticbeanstalk.com/api/$1',
        permanent: false, // Garante que é um rewrite (proxy), não um redirect 301
      },
    ];
  },
};

export default nextConfig;