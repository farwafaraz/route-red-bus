import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.VITE_DEV_PORT) || 5173;
  const extraHosts = (env.VITE_ALLOWED_HOST || '').split(',').map((host) => host.trim()).filter(Boolean);

  // Leading dot = the domain and all of its subdomains. No temporary ngrok URL is hardcoded.
  const allowedHosts = ['localhost', '.ngrok-free.app', '.ngrok-free.dev', '.ngrok.io', '.ngrok.app', '.ngrok.dev', ...extraHosts];

  return {
    plugins: [react()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    optimizeDeps: { exclude: ['lucide-react'] },
    server: { host: true, port, strictPort: true, allowedHosts },
    preview: { host: true, port, strictPort: true, allowedHosts },
  };
});
