export const CORS_ORIGINS = {
  production: process.env.FRONTEND_URL,
  development: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://studio.apollographql.com',
    'https://apollo-studio-embed.vercel.app',
  ],
};

export const CORS_CONFIG = {
  origin:
    process.env.NODE_ENV === 'production' ? CORS_ORIGINS.production : CORS_ORIGINS.development,
  credentials: true,
};

export const SERVER_CONFIG = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

export const APOLLO_CONFIG = {
  introspection: process.env.NODE_ENV !== 'production',
  csrfPrevention: process.env.NODE_ENV === 'production',
} as const;

export const HELMET_CONFIG = {
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
} as const;
