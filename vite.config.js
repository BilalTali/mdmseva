import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
        // Gzip compression for production builds
        // viteCompression({
        //     algorithm: 'gzip',
        //     ext: '.gz',
        // }),
    ],
});
