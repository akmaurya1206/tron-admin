import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    host: true,
    port: 5173, 
    strictPort: true,
    hmr: {
      host: '68379999541c.ngrok-free.app', 
      clientPort: 443, 
      protocol: 'wss' 
    },
    cors: true, 
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With,content-type,Authorization"
    }
  },
  plugins: [react()],
  define: {
    'process.env': {} 
  }
})