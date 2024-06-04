import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    // створити захешований пароль
    const hash = await argon.hash(dto.password);
    // зберегти нового юзера в дб

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      return this.singToken(user.id, user.email);
    } catch (error) {
      // опис помилки, які можуть виникнути під час взаємодії з базою данних
      if (error instanceof PrismaClientKnownRequestError) {
        // опис помилки, якщо порушено унікальність
        if (error.code === 'P2002') {
          // викидання помилки, що операція не дозволенна, бо данні вже використовуються
          throw new ForbiddenException('Credential taken');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    // знайти юзера по емейлу
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // якщо користувача не існує, зробити виняток
    if (!user) throw new ForbiddenException('Credential incorect');
    // порівняти пароль
    const pwMatches = await argon.verify(user.hash, dto.password);
    // якщо пароль не правильний - зробити виняток
    if (!pwMatches) throw new ForbiddenException('Credential incorect');

    return this.singToken(user.id, user.email);
  }

  // створюємо функцію для створення JWT-токена
  async singToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    // створюємо пейлоад, який буде мати закодовану інформацію
    const payload = {
      sub: userId,
      email,
    };
    // дістаємо з env secret
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}
