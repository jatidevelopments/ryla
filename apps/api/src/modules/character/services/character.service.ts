import { Injectable } from '@nestjs/common';
import { CharacterCacheService } from './character-cache.service';
import { CharacterRepository } from '@ryla/data';

@Injectable()
export class CharacterService {
  constructor(
    private readonly characterCacheService: CharacterCacheService,
    private readonly characterRepository: CharacterRepository,
  ) { }

  async findAll(userId: string) {
    return this.characterRepository.findAll(userId);
  }
}
