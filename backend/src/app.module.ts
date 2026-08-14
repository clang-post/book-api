import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorModule } from './author/author.module';
import { BookModule } from './book/book.module';
import { Author } from './author/author.entity';
import { Book } from './book/book.entity';

const databasePath =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.DATABASE_PATH ?? 'book_api.db';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: databasePath,
      entities: [Author, Book],
      synchronize: true,
    }),
    AuthorModule,
    BookModule,
  ],
})
export class AppModule {}
