import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Author } from '../author/author.entity';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToOne(() => Author, (author) => author.book, { nullable: true })
  @JoinColumn({ name: 'authorId' })
  author?: Author;

  @Column({ nullable: true })
  isbn: string;
}
