import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { join } from 'path'

// server of your OpenAvatarChat
// if you are not use localhost, you need to start https
const serverIP = '127.0.0.1'
const serverPort = '8282'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
  server: {
    // host: '0.0.0.0',
    // https: true,
    // port: 443,
    proxy: {
      '/download': {
        target: `https://${serverIP}:${serverPort}`,
        changeOrigin: true,
        secure: false,
      },
      '/openavatarchat': {
        target: `https://${serverIP}:${serverPort}`,
        changeOrigin: true,
        secure: false,
      },
      '/webrtc/offer': {
        target: `https://${serverIP}:${serverPort}`,
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: `wss://${serverIP}:${serverPort}`,
        ws: true,
        rewriteWsOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
    },
  },
})
