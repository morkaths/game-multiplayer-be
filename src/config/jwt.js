import dotenv from 'dotenv';

dotenv.config();

// JWT Config
export const JWT_SECRET = process.env.JWT_SECRET || 'game-multiplayer-secret-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // Hết hạn sau 24 giờ 