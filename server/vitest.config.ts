import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // Fausses variables d'environnement pour les tests : elles passent la
    // validation de config/env.ts sans utiliser les vraies clés du .env.
    // (dotenv n'écrase pas une variable déjà définie.)
    env: {
      PORT: '3000',
      SUPABASE_URL: 'https://test-project.supabase.co',
      SUPABASE_SECRET_KEY: 'test-secret-key',
      CLIENT_URL: 'http://localhost:5173',
      ADMIN_TOKEN: 'test-admin-token-123456',
    },
  },
});
