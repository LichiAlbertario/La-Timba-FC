import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Las Server Actions (subida de fotos/escudos/camisetas) por defecto
    // limitan el body a 1MB, y una foto en PNG sin comprimir lo supera
    // facil (a diferencia de un JPG). Subimos el limite para admitir fotos
    // de celular en cualquier formato.
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      // Escudos de equipos que vienen del sync con la plataforma de la liga (iBaires / Todo Torneos).
      { protocol: "https", hostname: "ibaires.com.ar" },
      { protocol: "https", hostname: "*.ibaires.com.ar" },
      { protocol: "https", hostname: "ihotelapp.com" },
      { protocol: "https", hostname: "*.ihotelapp.com" },
    ],
  },
};

export default nextConfig;
