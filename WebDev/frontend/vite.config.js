import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(), // ✅ Ensure Tailwind is configured correctly
    react(),
  ],
  base: "/", // ✅ Correct base path for Vercel deployment
  build: {
    outDir: "dist", // ✅ Ensure Vercel uses 'dist' for output
    emptyOutDir: true, // Clears previous build before deploying
  },
  server: {
    proxy: {
      "/api": {
        target: "https://mindsync-backend.up.railway.app", // ✅ Correct backend URL
        changeOrigin: true,
        secure: true, // Switch this to true if using HTTPS (recommended)
      },
    },
  },
});
