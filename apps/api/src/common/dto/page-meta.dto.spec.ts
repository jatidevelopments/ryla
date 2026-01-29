import { describe, it, expect } from 'vitest';
import { PageMetaDto } from './page-meta.dto';

describe('PageMetaDto', () => {
  describe('constructor', () => {
    it('should create with default values', () => {
      const meta = new PageMetaDto({
        pageOptionsDto: {},
        itemCount: 0,
      });

      expect(meta.page).toBe(1);
      expect(meta.take).toBe(10);
      expect(meta.itemCount).toBe(0);
      expect(meta.pageCount).toBe(0);
      expect(meta.hasPreviousPage).toBe(false);
      expect(meta.hasNextPage).toBe(false);
    });

    it('should create with custom page options', () => {
      const meta = new PageMetaDto({
        pageOptionsDto: { page: 2, take: 20 },
        itemCount: 50,
      });

      expect(meta.page).toBe(2);
      expect(meta.take).toBe(20);
      expect(meta.itemCount).toBe(50);
      expect(meta.pageCount).toBe(3);
      expect(meta.hasPreviousPage).toBe(true);
      expect(meta.hasNextPage).toBe(true);
    });

    it('should calculate pageCount correctly', () => {
      const meta1 = new PageMetaDto({
        pageOptionsDto: { page: 1, take: 10 },
        itemCount: 25,
      });
      expect(meta1.pageCount).toBe(3);

      const meta2 = new PageMetaDto({
        pageOptionsDto: { page: 1, take: 10 },
        itemCount: 30,
      });
      expect(meta2.pageCount).toBe(3);

      const meta3 = new PageMetaDto({
        pageOptionsDto: { page: 1, take: 10 },
        itemCount: 31,
      });
      expect(meta3.pageCount).toBe(4);
    });

    it('should set hasPreviousPage correctly', () => {
      const meta1 = new PageMetaDto({
        pageOptionsDto: { page: 1, take: 10 },
        itemCount: 50,
      });
      expect(meta1.hasPreviousPage).toBe(false);

      const meta2 = new PageMetaDto({
        pageOptionsDto: { page: 2, take: 10 },
        itemCount: 50,
      });
      expect(meta2.hasPreviousPage).toBe(true);
    });

    it('should set hasNextPage correctly', () => {
      const meta1 = new PageMetaDto({
        pageOptionsDto: { page: 1, take: 10 },
        itemCount: 5,
      });
      expect(meta1.hasNextPage).toBe(false);

      const meta2 = new PageMetaDto({
        pageOptionsDto: { page: 1, take: 10 },
        itemCount: 25,
      });
      expect(meta2.hasNextPage).toBe(true);

      const meta3 = new PageMetaDto({
        pageOptionsDto: { page: 3, take: 10 },
        itemCount: 25,
      });
      expect(meta3.hasNextPage).toBe(false);
    });

    it('should handle edge case with exact page count', () => {
      const meta = new PageMetaDto({
        pageOptionsDto: { page: 2, take: 10 },
        itemCount: 20,
      });

      expect(meta.pageCount).toBe(2);
      expect(meta.hasPreviousPage).toBe(true);
      expect(meta.hasNextPage).toBe(false);
    });
  });
});
