import 'reflect-metadata';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../modules/app.module';
import { createTestDb } from './test-db';
import { ConfigService } from '@nestjs/config';

export async function createTestingModule() {
    const { db } = await createTestDb();

    const moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideProvider('DRIZZLE_DB')
        .useValue(db)
        .overrideProvider(ConfigService)
        .useValue({
            get: (key: string) => {
                if (key === 'postgres') return { environment: 'local' };
                return null;
            },
        });

    // Add more common overrides here (Redis, Mail, etc.)
    // .overrideProvider(RedisService).useValue(mockRedis)

    return moduleBuilder.compile();
}
