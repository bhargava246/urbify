import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodemailer = require('nodemailer');

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: any;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host:   configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port:   configService.get<number>('SMTP_PORT', 465),
      secure: configService.get<string>('SMTP_SECURE', 'true') === 'true',
      auth: {
        user: configService.get<string>('SMTP_USER'),
        pass: configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    const subject = 'Your Urbify OTP';
    const html = `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px">
        <h1 style="font-size:24px;font-weight:800;color:#0D7C66;margin:0 0 8px">Urbify</h1>
        <p style="color:#374151;margin:0 0 24px">Your one-time password is:</p>
        <div style="background:#fff;border-radius:8px;padding:24px;text-align:center;border:1px solid #e5e7eb">
          <span style="font-size:40px;font-weight:800;letter-spacing:8px;color:#111827">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:13px;margin:16px 0 0">Valid for 5 minutes. Do not share this with anyone.</p>
      </div>
    `;
    await this.transporter.sendMail({
      from: `"Urbify" <${this.configService.get('SMTP_USER')}>`,
      to,
      subject,
      html,
    });
    this.logger.log(`[DEVELOPMENT/TEST] OTP for ${to} is ${otp}`);
    this.logger.log(`OTP email sent to ${to}`);
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"Urbify" <${this.configService.get('SMTP_USER')}>`,
      to,
      subject,
      html,
    });
    this.logger.log(`Email sent to ${to} — ${subject}`);
  }
}
