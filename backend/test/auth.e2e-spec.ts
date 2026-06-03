import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new CLIENT user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          phone: '+919000000001',
          password: 'TestPass@123',
          role: 'CLIENT',
          fullName: 'Test Client',
        })
        .expect(201);

      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should reject duplicate phone registration', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          phone: '+919000000001',
          password: 'TestPass@123',
          role: 'CLIENT',
          fullName: 'Test Client 2',
        })
        .expect(409);
    });

    it('should reject invalid phone format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          phone: '12345',
          password: 'TestPass@123',
          role: 'CLIENT',
          fullName: 'Bad Phone',
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ phone: '+919000000001', password: 'TestPass@123' })
        .expect(200);

      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should reject wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ phone: '+919000000001', password: 'WrongPass@123' })
        .expect(401);
    });
  });
});
