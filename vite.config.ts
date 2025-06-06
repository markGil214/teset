import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/teset/", // Replace with your GitHub repository name
  server: {
    allowedHosts: [".ngrok-free.app"],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
