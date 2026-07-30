import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Book } from '../book/book.entity';

@Entity()
export class Author {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  country: string;

  @OneToOne(() => Book, (book) => book.author)
  book?: Book;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
