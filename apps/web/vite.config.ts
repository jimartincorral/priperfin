import { defineConfig } from 'vite'

export default defineConfig({
    base: '/',  // Use absolute paths from root (not relative './')
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
