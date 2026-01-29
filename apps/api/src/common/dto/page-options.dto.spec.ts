import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { describe, it, expect } from 'vitest';
import { PageOptionsDto } from './page-options.dto';

describe('PageOptionsDto', () => {
  describe('validation', () => {
    it('should pass with valid default values', async () => {
      const dto = plainToInstance(PageOptionsDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.page).toBe(1);
      expect(dto.take).toBe(10);
    });

    it('should pass with valid custom values', async () => {
      const dto = plainToInstance(PageOptionsDto, {
        page: 2,
        take: 20,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.page).toBe(2);
      expect(dto.take).toBe(20);
    });

    it('should transform string numbers to numbers', async () => {
      const dto = plainToInstance(PageOptionsDto, {
        page: '3',
        take: '15',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.page).toBe(3);
      expect(dto.take).toBe(15);
    });

    it('should fail with page less than 1', async () => {
      const dto = plainToInstance(PageOptionsDto, {
        page: 0,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
    });

    it('should fail with take less than 1', async () => {
      const dto = plainToInstance(PageOptionsDto, {
        take: 0,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('take');
    });

    it('should fail with take greater than 50', async () => {
      const dto = plainToInstance(PageOptionsDto, {
        take: 51,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('take');
    });

    it('should fail with non-integer page', async () => {
      const dto = plainToInstance(PageOptionsDto, {
        page: 1.5,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
    });

    it('should fail with non-integer take', async () => {
      const dto = plainToInstance(PageOptionsDto, {
        take: 10.5,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('take');
    });

    it('should allow take at maximum 50', async () => {
      const dto = plainToInstance(PageOptionsDto, {
        take: 50,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.take).toBe(50);
    });
  });
});
