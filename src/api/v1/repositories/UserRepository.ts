import { PrismaClient } from '@prisma/client';
import { Args, DynamicModelExtensionThis } from '@prisma/client/runtime';
import { RegistrationDto, userGoogleLoginDto } from '@v1/interface';

import { prisma, Prisma, User } from '../config';
import { Unexpected, UserAlreadyExists } from './exceptions';

export default class UserRepository {
  public static async findOneById(id: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: id,
      },
    });
    return user ?? null;
  }
  public static async findOneByEmail(email: string) {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    return user ?? null;
  }
  public static createOne = async (user: RegistrationDto): Promise<User> => {
    const execute: string | any[] = [];
    const userFound = await this.findOneByEmail(user.email);
    if (userFound) throw new UserAlreadyExists();
    execute.push(
      prisma.user.create({
        data: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      }),
    );
    const [res] = await prisma.$transaction(execute, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
    return res;
  };
  public static createOneFromGoogle = async (user: userGoogleLoginDto): Promise<User> => {
    const execute: string | any[] = [];
    execute.push(
      prisma.user.create({
        data: {
          email: user.email,
          firstName: user.family_name,
          lastName: user.given_name,
        },
      }),
    );
    const [res] = await prisma.$transaction(execute, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
    return res;
  };
  public static AddChallenge = async (userId: string, challenge: string) => {
    try {
      const execute: string | any[] = [];
      execute.push(
        prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            currentChallenge: challenge,
          },
        }),
      );
      if (execute.length > 0) {
        await prisma.$transaction(execute);
      }
    } catch (error) {
      console.log(error);
      throw new Unexpected();
    }
  };
  public static Test = async (id: string) => {
    const xprisma = prisma.$extends({
      result: {
        user: {
          recipient: {
            needs: { id: true },
            compute(user) {
              return user.id == id ? true : false;
            },
          },
          current_page: {
            needs: { id: true },
            compute(data) {
              return data.id;
            },
          },
        },
      },
    });
    return await xprisma.user.findMany({
      skip: 1,
    });
  };
}
