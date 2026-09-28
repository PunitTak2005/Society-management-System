import jwt from 'jsonwebtoken';

export const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_STRING;
  if (!secret) {
    throw new Error('JWT Secret is not configured. Please set JWT_SECRET or JWT_SECRET_STRING in your environment variables.');
  }
  const expiresIn = process.env.JWT_EXPIRE || process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};
