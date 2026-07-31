import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './book.entity';
import { CreateBookDto } from './create-book.dto';
import { Author } from '../author/author.entity';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async findAll(): Promise<Book[]> {
    return this.bookRepository.find({ relations: { author: true } });
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }
    return book;
  }

  async create(dto: CreateBookDto): Promise<Book> {
    const bookData: Partial<Book> = {
      title: dto.title,
      isbn: dto.isbn,
    };

    if (dto.authorId !== undefined) {
      const author = await this.authorRepository.findOne({
        where: { id: dto.authorId },
      });

      if (!author) {
        throw new NotFoundException(`Author with id ${dto.authorId} not found`);
      }

      bookData.author = author;
    }

    const book = this.bookRepository.create(bookData);
    return this.bookRepository.save(book);
  }

  async createMultiple(dtos: CreateBookDto[]): Promise<Book[]> {
    const createdBooks: Book[] = [];

    for (const dto of dtos) {
      const createdBook = await this.create(dto);
      createdBooks.push(createdBook);
    }

    return createdBooks;
  }
}
