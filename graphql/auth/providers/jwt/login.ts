import jwt from 'jsonwebtoken';
import { LoginParams, LoginResult } from '../types';
import { JWT_SECRET } from '@/graphql/auth/constants';
import { ValidationError } from '@/graphql/errors';

export async function login({ input }: LoginParams): Promise<LoginResult> {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email)) {
    throw new ValidationError('Invalid email format');
  }

  // TODO: Replace with actual authentication
  // For demo purposes, we'll create a token that expires in 7 days
  const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
  const token = jwt.sign(
    {
      sub: '1234567890', // In production, use the actual user ID
      email: input.email,
      exp: Math.floor(Date.now() / 1000) + expiresIn,
    },
    JWT_SECRET
  );

  return { token };
}
