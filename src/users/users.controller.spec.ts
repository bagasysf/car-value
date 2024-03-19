import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { UserEntity } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUserService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUserService = {
      findOne: (id: number) =>
        Promise.resolve({
          id,
          email: 'test@mail.com',
          password: 'test',
        } as UserEntity),
      find: (email: string) => {
        return Promise.resolve([
          { id: 1, email, password: 'test' } as UserEntity,
        ]);
      },
      // remove: () => {},
      // update: () => {},
    };

    fakeAuthService = {
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as UserEntity);
      },
      // signup: () => {},
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findUserByEmail return a list of users with given email', async () => {
    const user = await controller.findUserByEmail('test@mail.com');

    expect(user.length).toEqual(1);
    expect(user[0].email).toEqual('test@mail.com');
  });

  it('findUserByEmil throws an error if user with given email is not found', async () => {
    fakeUserService.find = () => Promise.resolve([]);

    await expect(controller.findUserByEmail('test@mail.com')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findUserById return a list of user with given id', async () => {
    const user = await controller.findUserById('1');

    expect(user).toBeDefined();
  });

  it('findUserById throws an error if user with given id is not found', async () => {
    fakeUserService.findOne = () => null;

    await expect(controller.findUserById('2')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('signin updates session object and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.signin(
      { email: 'test@mail.com', password: 'test' },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
