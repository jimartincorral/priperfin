import { defineConfig } from 'vite'

export default defineConfig({
    base: '',  // Use empty string for relative paths (e.g. "assets/index.js")
    build: {
        outDir: 'dist',
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            }
        }
    }
})
