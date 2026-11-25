import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

// Generates a short-lived Access Token (15m default).
// Contains minimal user identifier data to keep header size small and performant.
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
};

// Generates a long-lived Refresh Token (7d default).
// Contains the user ID and a unique cryptographically random salt/id.
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

// Verifies access token
export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.accessSecret);
};

// Verifies refresh token
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

