import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // 1. Import tailwindcss

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 2. Add tailwindcss as a plugin
  ],
});