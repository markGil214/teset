import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [".ngrok-free.app", ".share.zrok.io"],
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        ARScannerPage: 'public/ARScannerPage.html',
        BrainViewer: 'public/BrainViewer.html',
        KidneyViewer: 'public/KidneyViewer.html',
        LungsViewer: 'public/LungsViewer.html',
        SlicedHeartViewer: 'public/SlicedHeartViewer.html'
      }
    }
  }
});
