import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.bcrypt.saltRounds);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.expire as any,
  };
  return jwt.sign({ userId }, config.jwt.secret, options);
};

export const generateRefreshToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpire as any,
  };
  return jwt.sign({ userId }, config.jwt.refreshSecret, options);
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.jwt.secret);
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, config.jwt.refreshSecret);
};
