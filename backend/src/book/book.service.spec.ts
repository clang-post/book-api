import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookService } from './book.service';
import { NotFoundException } from '@nestjs/common';
import { Book } from './book.entity';
import { Author } from "../author/author.entity";

const mockBookRepository = {
  find: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
};

const mockAuthorRepository = {
  findOne: vi.fn(),
};

describe('BookService', () => {
  let service: BookService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BookService(mockBookRepository as any, mockAuthorRepository as any);
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      const books = [
        { id: 1, title: 'Pride and Prejudice', isbn: '978-0-14-143951-8' },
        { id: 2, title: 'The Adventures of Tom Sawyer', isbn: '978-0-14-243723-0' },
      ];
      mockBookRepository.find.mockResolvedValue(books);

      const result = await service.findAll();

      expect(result).toEqual(books);
      expect(mockBookRepository.find).toHaveBeenCalledWith({ relations: { author: true } });
    });

    it('should return an empty array when no books exist', async () => {
      mockBookRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single book by id', async () => {
      const book = {
        id: 1,
        title: 'Pride and Prejudice',
        authorId: 1,
        author: {
          id: 1,
          firstName: 'Jane',
          lastName: 'Austen',
          country: 'England',
          fullName: 'Jane Austen',
        },
        isbn: '978-0-14-143951-8',
      };
      mockBookRepository.findOne.mockResolvedValue(book);

      const result = await service.findOne(1);

      expect(result).toEqual(book);
      expect(mockBookRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { author: true },
      });
    });

    it('should throw NotFoundException when book is not found', async () => {
      mockBookRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should return multiple authors', async () => {
      const authorOne: Author = {
        id: 1,
        firstName: 'Charles',
        lastName: 'Dickens',
        country: 'England',
        fullName: 'Charles Dickens',
      };

      const authorTwo: Author = {
        id: 2,
        firstName: 'Mark',
        lastName: 'Twain',
        country: 'USA',
        fullName: 'Mark Twain',
      };

      mockBookRepository.findOne.mockResolvedValue({
        id: 1,
        title: 'A Collaborative Novel',
        author: authorOne,
        isbn: '000-0-0000-0000-0',
      });

      const result: Book = await service.findOne(1);

      expect(result.author).toBeDefined();
      expect(result.author?.fullName).toContain(authorOne.fullName);
      expect(result.author?.fullName).toContain(authorTwo.fullName);
    });
  });

  describe('create', () => {
    it('should create and return a new book', async () => {
      const dto = { title: 'Pride and Prejudice', authorId: 1, isbn: '978-0-14-143951-8' };
      const author = {
        id: 1,
        firstName: 'Jane',
        lastName: 'Austen',
        country: 'England',
        fullName: 'Jane Austen',
      };
      const createdBook = { title: dto.title, author, isbn: dto.isbn };
      const savedBook = { id: 1, ...createdBook, authorId: 1 };

      mockAuthorRepository.findOne.mockResolvedValue(author);
      mockBookRepository.create.mockReturnValue(createdBook);
      mockBookRepository.save.mockResolvedValue(savedBook);

      const result = await service.create(dto);

      expect(result).toEqual(savedBook);
      expect(mockAuthorRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockBookRepository.create).toHaveBeenCalledWith(createdBook);
      expect(mockBookRepository.save).toHaveBeenCalledWith(createdBook);
    });

    it('should throw NotFoundException when the author does not exist', async () => {
      const dto = { title: 'Pride and Prejudice', authorId: 999, isbn: '978-0-14-143951-8' };

      mockAuthorRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(
        new NotFoundException('Author with id 999 not found'),
      );
      expect(mockAuthorRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(mockBookRepository.create).not.toHaveBeenCalled();
      expect(mockBookRepository.save).not.toHaveBeenCalled();
    });

    it('should always create a new record even when the same book is submitted again', async () => {
      const dto = { title: 'Pride and Prejudice', authorId: 1, isbn: '978-0-14-143951-8' };
      const author = {
        id: 1,
        firstName: 'Jane',
        lastName: 'Austen',
        country: 'England',
        fullName: 'Jane Austen',
      };
      const createdBook = { title: dto.title, author, isbn: dto.isbn };
      const firstRecord = { id: 1, ...createdBook, authorId: 1 };
      const secondRecord = { id: 2, ...createdBook, authorId: 1 };

      mockAuthorRepository.findOne.mockResolvedValue(author);
      mockBookRepository.create.mockReturnValue(createdBook);
      mockBookRepository.save
        .mockResolvedValueOnce(firstRecord)
        .mockResolvedValueOnce(secondRecord);

      const first = await service.create(dto);
      const second = await service.create(dto);

      expect(first.id).not.toEqual(second.id);
    });

    it('should return the same id when a record with the same book title is submitted again', async () => {
      const dto = { title: 'The Great Gatsby', authorId: 1, isbn: '978-0-7432-7356-5' };
      const author = {
        id: 1,
        firstName: 'F. Scott',
        lastName: 'Fitzgerald',
        country: 'USA',
        fullName: 'F. Scott Fitzgerald',
      };
      const createdBook = { title: dto.title, author, isbn: dto.isbn };

      mockAuthorRepository.findOne.mockResolvedValue(author);
      mockBookRepository.create.mockReturnValue(createdBook);
      mockBookRepository.save
        .mockResolvedValueOnce({ id: 1, ...createdBook, authorId: 1 })
        .mockResolvedValueOnce({ id: 2, ...createdBook, authorId: 1 });

      const first = await service.create(dto);
      const second = await service.create(dto);

      expect(first.id).toEqual(second.id);
    });
  });

  describe('createMultiple', () => {
    it('should create multiple books and return them in order', async () => {
      const firstDto = {
        title: 'Pride and Prejudice',
        authorId: 1,
        isbn: '978-0-14-143951-8',
      };
      const secondDto = {
        title: 'Sense and Sensibility',
        authorId: 1,
        isbn: '978-0-14-143966-2',
      };
      const author = {
        id: 1,
        firstName: 'Jane',
        lastName: 'Austen',
        country: 'England',
        fullName: 'Jane Austen',
      };
      const firstCreatedBook = { title: firstDto.title, author, isbn: firstDto.isbn };
      const secondCreatedBook = { title: secondDto.title, author, isbn: secondDto.isbn };
      const firstSavedBook = { id: 1, ...firstCreatedBook, authorId: 1 };
      const secondSavedBook = { id: 2, ...secondCreatedBook, authorId: 1 };

      mockAuthorRepository.findOne.mockResolvedValue(author);
      mockBookRepository.create
        .mockReturnValueOnce(firstCreatedBook)
        .mockReturnValueOnce(secondCreatedBook);
      mockBookRepository.save
        .mockResolvedValueOnce(firstSavedBook)
        .mockResolvedValueOnce(secondSavedBook);

      const result = await service.createMultiple([firstDto, secondDto]);

      expect(result).toEqual([firstSavedBook, secondSavedBook]);
      expect(mockAuthorRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockBookRepository.save).toHaveBeenCalledTimes(2);
    });

    it('should throw when one of the books references an unknown author', async () => {
      const firstDto = {
        title: 'Pride and Prejudice',
        authorId: 1,
        isbn: '978-0-14-143951-8',
      };
      const secondDto = {
        title: 'Unknown Author Book',
        authorId: 999,
        isbn: '978-0-00-000000-0',
      };
      const author = {
        id: 1,
        firstName: 'Jane',
        lastName: 'Austen',
        country: 'England',
        fullName: 'Jane Austen',
      };
      const firstCreatedBook = { title: firstDto.title, author, isbn: firstDto.isbn };
      const firstSavedBook = { id: 1, ...firstCreatedBook, authorId: 1 };

      mockAuthorRepository.findOne
        .mockResolvedValueOnce(author)
        .mockResolvedValueOnce(null);
      mockBookRepository.create.mockReturnValue(firstCreatedBook);
      mockBookRepository.save.mockResolvedValueOnce(firstSavedBook);

      await expect(service.createMultiple([firstDto, secondDto])).rejects.toThrow(
        new NotFoundException('Author with id 999 not found'),
      );
      expect(mockBookRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
