import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(async ({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      react(),
      // Only use runtime error overlay in development
      ...(isProduction ? [] : [runtimeErrorOverlay()]),
      // Only use cartographer in development on Replit
      ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
        ? [
            await import("@replit/vite-plugin-cartographer").then((m) =>
              m.cartographer(),
            ),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
      // Optimize production build
      minify: isProduction,
      sourcemap: !isProduction,
      // Split chunks for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'wouter', '@tanstack/react-query'],
            ui: [
              '@radix-ui/react-dialog',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
              'lucide-react',
            ],
          },
        },
      },
    },
    // Optimize server in production
    server: {
      port: 3000,
      strictPort: true,
      host: true,
    },
  };
});
