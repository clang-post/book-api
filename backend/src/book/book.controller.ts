import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './create-book.dto';
import { Book } from './book.entity';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  findAll(): Promise<Book[]> {
    return this.bookService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Book> {
    return this.bookService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBookDto): Promise<Book> {
    return this.bookService.create(dto);
  }

  @Post('multiple')
  createMultiple(
    @Body(new ParseArrayPipe({ items: CreateBookDto })) dtos: CreateBookDto[],
  ): Promise<Book[]> {
    return this.bookService.createMultiple(dtos);
  }
}
