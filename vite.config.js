import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
        plugins: [react()],
        server: {
            port: env.VITE_PORT || 5173,
            force: true,
            proxy: {
                "/api": {
                    target: env.VITE_API_BASE_URL || "http://localhost:8080",
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(/^\/api/, ""),
                    configure: (proxy) => {
                        proxy.on('error', (err) => {
                            console.log('proxy error', err);
                        });
                        proxy.on('proxyReq', (proxyReq, req) => {
                            console.log('Sending Request to the Target:', req.method, req.url);
                        });
                        proxy.on('proxyRes', (proxyRes, req) => {
                            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                        });
                    },
                },
            },
            allowedHosts: ['core.fancy.az']
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
    };
});
