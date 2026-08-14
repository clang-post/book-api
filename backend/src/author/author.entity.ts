import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
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

  @OneToMany(() => Book, (book) => book.author)
  books?: Book[];

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
