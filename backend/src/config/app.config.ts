import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  encryptionKey: process.env.ENCRYPTION_KEY as string,
  listingExpiryDays: parseInt(process.env.LISTING_EXPIRY_DAYS ?? '30', 10),
  platformFeeDays: parseFloat(process.env.PLATFORM_FEE_DAYS ?? '7.5'),
  gstRate: parseFloat(process.env.GST_RATE ?? '0.18'),
}));
