import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export interface JwtRefreshPayload {
  sub: string;
  email: string;
  role: string;
  refreshToken: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.refreshSecret')!,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: Omit<JwtRefreshPayload, 'refreshToken'>): JwtRefreshPayload {
    const refreshToken = (req.body as { refreshToken?: string }).refreshToken;
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');
    return { ...payload, refreshToken };
  }
}
