import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookService } from './book.service';
import { NotFoundException } from '@nestjs/common';

const mockBookRepository = {
  find: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
};

describe('BookService', () => {
  let service: BookService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BookService(mockBookRepository as any);
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      const books = [
        { id: 1, title: 'Pride and Prejudice', authorId: 1, isbn: '978-0-14-143951-8' },
        { id: 2, title: 'The Adventures of Tom Sawyer', authorId: 2, isbn: '978-0-14-243723-0' },
      ];
      mockBookRepository.find.mockResolvedValue(books);

      const result = await service.findAll();

      expect(result).toEqual(books);
      expect(mockBookRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no books exist', async () => {
      mockBookRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single book by id', async () => {
      const book = { id: 1, title: 'Pride and Prejudice', authorId: 1, isbn: '978-0-14-143951-8' };
      mockBookRepository.findOne.mockResolvedValue(book);

      const result = await service.findOne(1);

      expect(result).toEqual(book);
      expect(mockBookRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when book is not found', async () => {
      mockBookRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new book', async () => {
      const dto = { title: 'Pride and Prejudice', authorId: 1, isbn: '978-0-14-143951-8' };
      const savedBook = { id: 1, ...dto };

      mockBookRepository.create.mockReturnValue(dto);
      mockBookRepository.save.mockResolvedValue(savedBook);

      const result = await service.create(dto);

      expect(result).toEqual(savedBook);
      expect(mockBookRepository.create).toHaveBeenCalledWith(dto);
      expect(mockBookRepository.save).toHaveBeenCalledWith(dto);
    });

    it('should always create a new record even when the same book is submitted again', async () => {
      const dto = { title: 'Pride and Prejudice', authorId: 1, isbn: '978-0-14-143951-8' };
      const firstRecord = { id: 1, ...dto };
      const secondRecord = { id: 2, ...dto };

      mockBookRepository.create.mockReturnValue(dto);
      mockBookRepository.save
        .mockResolvedValueOnce(firstRecord)
        .mockResolvedValueOnce(secondRecord);

      const first = await service.create(dto);
      const second = await service.create(dto);

      // POST always creates a new record — even duplicates get a new id
      expect(first.id).not.toEqual(second.id);
    });
  });
});

// =============================================================================
// INTENTIONALLY FAILING TESTS
// These tests represent features that are NOT yet implemented in the API.
// It is the candidate's job to understand WHY they fail and HOW to fix them.
// =============================================================================

describe('BookService - Candidate Challenges (Intentionally Failing)', () => {
  let service: BookService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BookService(mockBookRepository as any);
  });

  /**
   * FAILING TEST 1
   * ---------------
   * The API currently always creates a new record on POST, regardless of whether
   * a book with the same title already exists. This test expects that creating a
   * book with a title that already exists in the database returns the SAME id as
   * the original record.
   *
   * To fix: Add deduplication logic in BookService.create() so that if a book
   * with the same title already exists, the existing record is returned instead
   * of inserting a new one.
   */
  it('Creating a record with the same book title returns the same id', async () => {
    const dto = { title: 'The Great Gatsby', authorId: 1, isbn: '978-0-7432-7356-5' };

    // The service always inserts — each call gets a brand-new auto-incremented id
    mockBookRepository.create.mockReturnValue(dto);
    mockBookRepository.save
      .mockResolvedValueOnce({ id: 1, ...dto })  // first insert → id 1
      .mockResolvedValueOnce({ id: 2, ...dto }); // second insert → id 2 (new row!)

    const first = await service.create(dto);
    const second = await service.create(dto);

    // This FAILS: the test expects the same id (deduplication), but the service
    // always creates a new row, so first.id=1 and second.id=2 are different.
    expect(first.id).toEqual(second.id);
  });

  /**
   * FAILING TEST 2
   * ---------------
   * The Book entity only stores a single authorId (integer column). There is no
   * foreign-key relationship to the Author table, and no mechanism to associate
   * multiple authors with a book. This test expects that when a book has two
   * associated authors, fetching that book returns the full names of both authors.
   *
   * To fix:
   *   1. Create a join/pivot table (or a many-to-many relation) between Book and Author.
   *   2. Update BookService.findOne() to eagerly load authors and return their full names.
   */
  it('A book can have two authors — fetching the book returns full names of both authors', async () => {
    const author1 = { id: 1, firstName: 'Charles', lastName: 'Dickens', country: 'England' };
    const author2 = { id: 2, firstName: 'Mark', lastName: 'Twain', country: 'USA' };

    // The current Book entity has only one authorId — it cannot hold two authors
    const book = {
      id: 1,
      title: 'A Collaborative Novel',
      authorId: 1,   // only one author can be stored
      isbn: '000-0-0000-0000-0',
    };

    mockBookRepository.findOne.mockResolvedValue(book);

    const result: any = await service.findOne(1);

    // This fails because the Book entity has no concept of multiple authors or their full names
    expect(result.authors).toBeDefined();
    expect(result.authors).toHaveLength(2);
    expect(result.authors).toContainEqual(
      expect.objectContaining({ fullName: 'Charles Dickens' }),
    );
    expect(result.authors).toContainEqual(
      expect.objectContaining({ fullName: 'Mark Twain' }),
    );
  });
});
