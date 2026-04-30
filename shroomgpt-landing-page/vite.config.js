import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Render (and other hosts) assign PORT; preview must listen on 0.0.0.0, not localhost.
const port = process.env.PORT
  ? Number.parseInt(String(process.env.PORT), 10)
  : 4173;

export default defineConfig({
  base: "/",
  plugins: [react()],
  publicDir: "public",
  preview: {
    host: true,
    port,
    strictPort: true,
    // Vite 6+ host header check; Render uses *.onrender.com
    allowedHosts: [".onrender.com", "shroomgpt.onrender.com"],
  },
  server: {
    host: true,
  },
});
