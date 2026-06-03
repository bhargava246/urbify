import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { Role } from '@prisma/client';
import { RegisterDto, LoginDto, VerifyOtpDto, SendOtpDto } from './dto';
import { IJwtPayload } from '../../common/interfaces/jwt-payload.interface';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  // ── Register ──────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<TokenPair> {
    this.logger.log(`Register attempt for email: ${dto.email}`);

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = await (this.prisma.user.create as any)({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role,
        ownerProfile:
          dto.role === Role.OWNER
            ? { create: { fullName: dto.fullName, city: dto.city ?? '', state: '' } }
            : undefined,
        brokerProfile:
          dto.role === Role.BROKER
            ? { create: { fullName: dto.fullName, city: dto.city ?? '', state: '', reraId: dto.reraId } }
            : undefined,
        clientProfile:
          dto.role === Role.CLIENT
            ? { create: { fullName: dto.fullName, city: dto.city } }
            : undefined,
      },
    });

    this.logger.log(`User registered: ${user.id} role=${user.role}`);

    // Send welcome OTP to verify email
    await this._sendOtpEmail(dto.email, user.id);

    return this.generateTokens({ sub: user.id, email: user.email!, role: user.role });
  }

  // ── Login ─────────────────────────────────────────────────────────────────────

  async login(dto: LoginDto): Promise<TokenPair> {
    this.logger.log(`Login attempt for email: ${dto.email}`);

    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || !user.passwordHash)
      throw new UnauthorizedException('Invalid credentials');
    if (user.isBanned)
      throw new UnauthorizedException('Account is banned');
    if (!user.isActive)
      throw new UnauthorizedException('Account is inactive');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    this.logger.log(`Login success: userId=${user.id} role=${user.role}`);
    return this.generateTokens({ sub: user.id, email: user.email!, role: user.role });
  }

  // ── OTP — send (handles both login and signup) ───────────────────────────────

  async sendOtp(email: string, dto?: Partial<SendOtpDto>): Promise<{ message: string }> {
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // New user — auto-create account (passwordless signup via OTP)
      const role = dto?.role ?? 'CLIENT' as any;
      const fullName = dto?.fullName ?? email.split('@')[0];
      user = await (this.prisma.user.create as any)({
        data: {
          email,
          role,
          ownerProfile:  role === 'OWNER'  ? { create: { fullName, city: dto?.city ?? '', state: '' } } : undefined,
          brokerProfile: role === 'BROKER' ? { create: { fullName, city: dto?.city ?? '', state: '', reraId: dto?.reraId } } : undefined,
          clientProfile: role === 'CLIENT' ? { create: { fullName, city: dto?.city } } : undefined,
        },
      });
      this.logger.log(`New user created via OTP signup: ${user!.id} role=${role}`);
    }

    await this._sendOtpEmail(email, user!.id);
    return { message: 'OTP sent to your email' };
  }

  // ── OTP — verify ──────────────────────────────────────────────────────────────

  async verifyOtp(dto: VerifyOtpDto): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || !user.otpCode || !user.otpExpiresAt)
      throw new BadRequestException('No OTP found for this email');

    if (new Date() > user.otpExpiresAt)
      throw new BadRequestException('OTP has expired. Request a new one.');

    const match = await bcrypt.compare(dto.otp, user.otpCode);
    if (!match) throw new BadRequestException('Invalid OTP');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiresAt: null, isVerified: true },
    });

    this.logger.log(`OTP verified for userId=${user.id}`);
    return this.generateTokens({ sub: user.id, email: user.email!, role: user.role });
  }

  // ── Token refresh ─────────────────────────────────────────────────────────────

  async refreshTokens(userId: string, refreshToken: string): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Access denied');

    const match = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!match) throw new UnauthorizedException('Refresh token mismatch');

    return this.generateTokens({ sub: user.id, email: user.email!, role: user.role });
  }

  // ── Logout ────────────────────────────────────────────────────────────────────

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    this.logger.log(`User logout: userId=${userId}`);
  }


  // ── Forgot password — send OTP ────────────────────────────────────────────────

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('No account found for this email');
    await this._sendOtpEmail(email, user.id);
    return { message: 'Password reset OTP sent to your email' };
  }

  // ── Reset password — verify OTP + set new password ───────────────────────────

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.otpCode || !user.otpExpiresAt)
      throw new BadRequestException('No OTP found. Please request a new one.');
    if (new Date() > user.otpExpiresAt)
      throw new BadRequestException('OTP has expired. Request a new one.');
    const match = await bcrypt.compare(otp, user.otpCode);
    if (!match) throw new BadRequestException('Invalid OTP');
    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, otpCode: null, otpExpiresAt: null },
    });
    this.logger.log(`Password reset for userId=${user.id}`);
    return { message: 'Password updated successfully. Please sign in.' };
  }

  // ── Private helpers ───────────────────────────────────────────────────────────

  private async _sendOtpEmail(email: string, userId: string): Promise<void> {
    const otp = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await this.prisma.user.update({
      where: { id: userId },
      data: { otpCode: await bcrypt.hash(otp, 6), otpExpiresAt: expiresAt },
    });
    await this.emailService.sendOtp(email, otp);
    this.logger.log(`OTP email sent to ${email}`);
  }

  private async generateTokens(payload: IJwtPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret:    this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret:    this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
    ]);

    const hashedRt = await bcrypt.hash(refreshToken, this.SALT_ROUNDS);
    await this.prisma.user.update({ where: { id: payload.sub }, data: { refreshToken: hashedRt } });

    return { accessToken, refreshToken };
  }
}
