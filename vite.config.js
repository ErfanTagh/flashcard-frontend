import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3001,
    hmr: {
      host: process.env.VITE_HMR_HOST || "localhost",
      // Port the browser dials, which differs from the server port whenever the
      // dev server is published on a remapped host port.
      clientPort: Number(process.env.VITE_HMR_CLIENT_PORT) || 3001,
    },
    watch: {
      usePolling: true,
    },
    proxy: {
      "/api": {
        target: "http://backend:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
