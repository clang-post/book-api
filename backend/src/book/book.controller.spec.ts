import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookController } from './book.controller';

const mockBookService = {
  findAll: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  createMultiple: vi.fn(),
};

describe('BookController', () => {
  let controller: BookController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new BookController(mockBookService as any);
  });

  it('should create multiple books', async () => {
    const dtos = [
      { title: 'Pride and Prejudice', authorId: 1, isbn: '978-0-14-143951-8' },
      { title: 'Sense and Sensibility', authorId: 1, isbn: '978-0-14-143966-2' },
    ];
    const created = [
      { id: 1, ...dtos[0] },
      { id: 2, ...dtos[1] },
    ];
    mockBookService.createMultiple.mockResolvedValue(created);

    const result = await controller.createMultiple(dtos);

    expect(result).toEqual(created);
    expect(mockBookService.createMultiple).toHaveBeenCalledWith(dtos);
  });
});
