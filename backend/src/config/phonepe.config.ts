import { registerAs } from '@nestjs/config';

export default registerAs('phonepe', () => ({
  merchantId:   process.env.PHONEPE_MERCHANT_ID as string,
  saltKey:      process.env.PHONEPE_SALT_KEY as string,
  saltIndex:    process.env.PHONEPE_SALT_INDEX ?? '1',
  /**
   * Production:  https://api.phonepe.com/apis/hermes
   * UAT/Sandbox: https://api-preprod.phonepe.com/apis/pg-sandbox
   */
  baseUrl:      process.env.PHONEPE_BASE_URL ?? 'https://api-preprod.phonepe.com/apis/pg-sandbox',
}));
