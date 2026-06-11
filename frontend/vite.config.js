import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    // Gzip for broad compatibility
    viteCompression({ algorithm: 'gzip', ext: '.gz', threshold: 1024 }),
    // Brotli for modern browsers — typically 20% smaller than gzip
    viteCompression({ algorithm: 'brotliCompress', ext: '.br', threshold: 1024 }),
  ],

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,

    // Raise chunk warning threshold to 600 kB (quill editor is large)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Manual chunk splitting — keeps the main bundle small
        manualChunks: {
          // React core — never changes, perfect for long-term browser caching
          'vendor-react': ['react', 'react-dom'],
          // Router — changes rarely
          'vendor-router': ['react-router-dom'],
          // Data layer
          'vendor-data': ['axios', 'zustand', 'date-fns'],
          // Quill (heavy) — only loaded on admin editor page
          'vendor-quill': ['quill', 'react-quill'],
          // Helmet
          'vendor-helmet': ['react-helmet-async'],
        },
      },
    },

    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        // Drop console.log in production for smaller bundle + no info leaks
        drop_console: true,
        drop_debugger: true,
        // Inline small functions (reduces call overhead)
        inline: 2,
        passes: 2,
      },
      mangle: true,
      format: {
        comments: false, // Strip all comments from output
      },
    },

    // CSS code splitting — each route gets only its own CSS
    cssCodeSplit: true,

    // Use modern targets — avoid polyfill bloat
    target: 'esnext',
  },

  // Enable pre-bundling optimizations for faster cold starts
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'zustand', 'date-fns'],
  },
});
