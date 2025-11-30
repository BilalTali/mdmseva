import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
        // Gzip compression for production builds
        import('vite-plugin-compression').then(m => m.default({
            algorithm: 'gzip',
            ext: '.gz',
        })),
    ],
});
