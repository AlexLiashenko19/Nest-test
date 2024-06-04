import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { createBookmarkDto } from 'src/bookmark/dto';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { AppModule } from '../src/app.module';
import { EditUserDto } from 'src/user/dto';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3000);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3000');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'sdfsfes@gmail.com',
      password: '1234',
    };
    describe('Singup', () => {
      it('should trow if email empty', () => {
        return pactum.spec().post('/auth/singup').withBody({
          password: dto.password,
        });
      });
      it('should trow if password empty', () => {
        return pactum.spec().post('/auth/singup').withBody({
          email: dto.email,
        });
      });
      it('should trow if no body probided', () => {
        return pactum.spec().post('/auth/singup');
      });
      it('should singup', () => {
        return pactum.spec().post('/auth/singup').withBody(dto);
      });
    });

    describe('Singin', () => {
      it('should trow if email empty', () => {
        return pactum.spec().post('/auth/singin').withBody({
          password: dto.password,
        });
      });
      it('should trow if password empty', () => {
        return pactum.spec().post('/auth/singin').withBody({
          email: dto.email,
        });
      });
      it('should trow if no body probided', () => {
        return pactum.spec().post('/auth/singin');
      });
      it('should singin', () => {
        return pactum
          .spec()
          .post('/auth/singin')
          .withBody(dto)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum.spec().get('/users/me').withHeaders({
          Autherization: 'Bearer ${userAt}',
        });
      });
    });

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'Sasha',
          email: 'Zelenskyy@gmail.com',
        };
        return pactum.spec().patch('/users/edit').withBody(dto);
      });
    });
  });
  describe('Bookmarks', () => {
    describe('Get empty bookmark', () => {
      it('should get bookmarks', () => {
        return pactum.spec().get('/bookmarks').withHeaders({
          Authorization: 'Bearer ${userAt}',
        });
      });
    });
    describe('Creaate bookmark', () => {
      const dto: createBookmarkDto = {
        title: 'First bookmark',
        link: 'https://www.youtube.com/watch?v=GHTA143_b-s&t=8572s&ab_channel=freeCodeCamp.org',
      };
      it('should create bookmarks', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer ${userAt}',
          })
          .withBody(dto)
          .stores('bookmarkId', 'id');
      });
    });
    describe('Get bookmark by id', () => {
      it('should get bookmarks by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer ${userAt}',
          });
      });
    });
    describe('Edit bookmark by id', () => {});
    describe('Delete bookmark by id', () => {});
  });
});
