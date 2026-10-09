import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    base: '/hyperdeck/',
    plugins: [preact(), tailwindcss()],
    build: {
        target: 'es2022',
    },
})
