import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Client } from 'pg';
import { configuration } from 'src/core';
import { Logger } from 'winston';

@Injectable()
export class DalService implements OnModuleInit {
  private db: NodePgDatabase<Record<string, never>>;

  constructor(
    // @Inject(WINSTON_MODULE_PROVIDER)
    // private readonly logger: Logger,
  ) {}

  async onModuleInit() {
    await this.connectToDatabase();
    console.log('Connected to database');
  }

  private async connectToDatabase() {
    const { host, port, user, password, database } = configuration().drizzle;
    const client = new Client({
      host,
      port,
      user,
      password,
      database,
    });

    await client.connect();
    this.db = drizzle(client);
  }

  endConnection() {
    this.db
  }

  getDatabaseInstance() {
    return this.db;
  }
}
