import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { describe, it, expect } from 'vitest';
import { PageDto } from './page.dto';
import { PageMetaDto } from './page-meta.dto';

describe('PageDto', () => {
  describe('constructor', () => {
    it('should create with data and meta', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const meta = new PageMetaDto({
        pageOptionsDto: { page: 1, take: 10 },
        itemCount: 2,
      });

      const page = new PageDto(data, meta);

      expect(page.data).toEqual(data);
      expect(page.meta).toBe(meta);
    });

    it('should create with empty data array', () => {
      const data: any[] = [];
      const meta = new PageMetaDto({
        pageOptionsDto: { page: 1, take: 10 },
        itemCount: 0,
      });

      const page = new PageDto(data, meta);

      expect(page.data).toEqual([]);
      expect(page.meta).toBe(meta);
    });

    it('should create with complex data types', () => {
      const data = [
        { id: 1, name: 'Test', nested: { value: 123 } },
        { id: 2, name: 'Test2', nested: { value: 456 } },
      ];
      const meta = new PageMetaDto({
        pageOptionsDto: { page: 1, take: 10 },
        itemCount: 2,
      });

      const page = new PageDto(data, meta);

      expect(page.data).toEqual(data);
      expect(page.data[0].nested.value).toBe(123);
    });
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const data = [{ id: 1 }];
      const meta = new PageMetaDto({
        pageOptionsDto: { page: 1, take: 10 },
        itemCount: 1,
      });

      const page = new PageDto(data, meta);
      const errors = await validate(page);

      expect(errors.length).toBe(0);
    });

    it('should fail validation if data is not an array', async () => {
      const meta = new PageMetaDto({
        pageOptionsDto: { page: 1, take: 10 },
        itemCount: 1,
      });

      // Create instance with invalid data type
      const page = new PageDto('not-an-array' as any, meta);
      const errors = await validate(page);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('data');
    });
  });
});
