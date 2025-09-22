export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRATION_MINUTES = Number(process.env.JWT_EXPIRATION_MINUTES) || 15;
export const REFRESH_TOKEN_EXPIRATION_DAYS =
  Number(process.env.REFRESH_TOKEN_EXPIRATION_DAYS) || 30;
