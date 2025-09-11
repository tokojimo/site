import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    manifest: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/js/script.js')
    }
  }
});
