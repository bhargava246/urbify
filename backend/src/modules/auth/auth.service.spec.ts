import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  },
};

const mockJwt = {
  signAsync: jest.fn().mockResolvedValue('mock-token'),
};

const mockConfig = {
  get: jest.fn((key: string) => {
    const map: Record<string, string> = {
      'jwt.accessSecret': 'access-secret',
      'jwt.accessExpiresIn': '15m',
      'jwt.refreshSecret': 'refresh-secret',
      'jwt.refreshExpiresIn': '7d',
    };
    return map[key];
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register()', () => {
    it('should throw ConflictException if phone already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          role: Role.CLIENT,
          fullName: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'test@example.com',
        role: Role.CLIENT,
      });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        role: Role.CLIENT,
        fullName: 'Test User',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('login()', () => {
    it('should throw UnauthorizedException with invalid credentials', async () => {
      const hash = await bcrypt.hash('correct-pass', 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: hash,
        isBanned: false,
        isActive: true,
        role: Role.CLIENT,
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong-pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens for correct credentials', async () => {
      const hash = await bcrypt.hash('correct-pass', 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: hash,
        isBanned: false,
        isActive: true,
        role: Role.CLIENT,
      });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.login({
        email: 'test@example.com',
        password: 'correct-pass',
      });

      expect(result).toHaveProperty('accessToken', 'mock-token');
    });
  });
});
