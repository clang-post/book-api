import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthorService } from './author.service';
import { NotFoundException } from '@nestjs/common';

const mockAuthorRepository = {
  find: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
};

describe('AuthorService', () => {
  let service: AuthorService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthorService(mockAuthorRepository as any);
  });

  describe('findAll', () => {
    it('should return an array of authors', async () => {
      const authors = [
        { id: 1, firstName: 'Jane', lastName: 'Austen', country: 'England' },
        { id: 2, firstName: 'Mark', lastName: 'Twain', country: 'USA' },
      ];
      mockAuthorRepository.find.mockResolvedValue(authors);

      const result = await service.findAll();

      expect(result).toEqual(authors);
      expect(mockAuthorRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no authors exist', async () => {
      mockAuthorRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single author by id', async () => {
      const author = { id: 1, firstName: 'Jane', lastName: 'Austen', country: 'England' };
      mockAuthorRepository.findOne.mockResolvedValue(author);

      const result = await service.findOne(1);

      expect(result).toEqual(author);
      expect(mockAuthorRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when author is not found', async () => {
      mockAuthorRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new author', async () => {
      const dto = { firstName: 'Jane', lastName: 'Austen', country: 'England' };
      const savedAuthor = { id: 1, ...dto };

      mockAuthorRepository.create.mockReturnValue(dto);
      mockAuthorRepository.save.mockResolvedValue(savedAuthor);

      const result = await service.create(dto);

      expect(result).toEqual(savedAuthor);
      expect(mockAuthorRepository.create).toHaveBeenCalledWith(dto);
      expect(mockAuthorRepository.save).toHaveBeenCalledWith(dto);
    });

    it('should always create a new author record even with the same data', async () => {
      const dto = { firstName: 'Jane', lastName: 'Austen', country: 'England' };
      const firstRecord = { id: 1, ...dto };
      const secondRecord = { id: 2, ...dto };

      mockAuthorRepository.create.mockReturnValue(dto);
      mockAuthorRepository.save
        .mockResolvedValueOnce(firstRecord)
        .mockResolvedValueOnce(secondRecord);

      const first = await service.create(dto);
      const second = await service.create(dto);

      // POST always creates a new record — even duplicates get a new id
      expect(first.id).not.toEqual(second.id);
    });
  });
});
