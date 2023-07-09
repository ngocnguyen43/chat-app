import { Container, ContainerModule } from 'inversify';

import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime';

import { AuthRepository, AuthService, IAuhtService, IAuthRepository, TYPES } from './auth/v1';
import { RegisterMiddleware } from './auth/v1/middleware/RegisterMiddleware';
import { prisma } from './config';

const thirdPartyDependencies = new ContainerModule((bind) => {
  bind<
    PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation, DefaultArgs>
  >(TYPES.Prisma).toConstantValue(prisma);
  // ..
});

const applicationDependencies = new ContainerModule((bind) => {
  bind<IAuthRepository>(TYPES.AuthRepository).to(AuthRepository);
  bind<IAuhtService>(TYPES.AuthService).to(AuthService);
  bind<RegisterMiddleware>(TYPES.Middleware).to(RegisterMiddleware);
  // ..
});
export const container = new Container({
  defaultScope: 'Singleton',
});
container.load(thirdPartyDependencies, applicationDependencies);
