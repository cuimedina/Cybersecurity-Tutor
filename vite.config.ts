import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This maps the code's "process.env.API_KEY" to Vite's "import.meta.env.VITE_API_KEY"
    // In Vercel, you must set the Environment Variable name to "VITE_API_KEY".
    'process.env.API_KEY': 'import.meta.env.VITE_API_KEY'
  }
});