import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Account, User } from 'src/typeorm';
import { DataSource } from 'typeorm';
import { Logger } from 'winston';

@Injectable()
export class UsersService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private entityManager: DataSource,
  ) {}

  async create(email: string, passwordHash: string) {
    return await this.entityManager.manager.transaction(async (manager) => {
      const user = await manager.save(User, { email, passwordHash });
      await manager.save(Account, { user });
      return user
    });
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.entityManager.manager.findOne(User, { where: { email } })
  }

  async findOneById(id: string): Promise<User | undefined> {
    return this.entityManager.manager.findOne(User, { where: { id } })
  }
}
