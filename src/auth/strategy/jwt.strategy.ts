import { PrismaService } from '../../prisma/prisma.service';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
// код, який перевіряє токени JWT, надіслані в заголовку Authorization у форматі токена Bearer
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      // Визначаємо, як отримати токен JWT із запиту
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Визначаємо секретний ключ, який використовується для перевірки токена JWT
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    delete user.hash;
    return user;
  }
}
