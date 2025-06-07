import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [".ngrok-free.app"],
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        // Add your HTML pages here if they need to be built separately
      }
    }
  },
  publicDir: 'public'
});
