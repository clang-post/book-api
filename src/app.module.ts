import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorModule } from './author/author.module';
import { BookModule } from './book/book.module';
import { Author } from './author/author.entity';
import { Book } from './book/book.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'book_api.db',
      entities: [Author, Book],
      synchronize: true,
    }),
    AuthorModule,
    BookModule,
  ],
})
export class AppModule {}
