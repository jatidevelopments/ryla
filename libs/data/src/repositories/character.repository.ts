import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema/index'; // Use the index to import all schemas
import { eq } from 'drizzle-orm';

@Injectable()
export class CharacterRepository {
    constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) { }

    async findAll(userId: string) {
        return this.db.query.characters.findMany({
            where: eq(schema.characters.userId, userId),
        });
    }
}

