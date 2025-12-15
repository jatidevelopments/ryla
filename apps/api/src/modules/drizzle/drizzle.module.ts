import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { Config, PostgresConfig } from '../../config/config.type';
import * as schema from '../../database/schemas';

@Global()
@Module({
  providers: [
    {
      provide: 'DRIZZLE_DB',
      useFactory: (configService: ConfigService<Config>) => {
        const config = configService.get<PostgresConfig>('postgres');
        if (!config) {
          throw new Error('Postgres config not found');
        }

        const pool = new Pool({
          host: config.host,
          port: config.port,
          user: config.user,
          password: config.password,
          database: config.dbName,
          ssl: config.environment !== 'local'
            ? { rejectUnauthorized: false }
            : false,
          max: 20,
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 30000,
        });

        return drizzle(pool, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DRIZZLE_DB'],
})
export class DrizzleModule {}

