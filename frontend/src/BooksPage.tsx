import { useEffect, useState } from 'react';
import axios from 'axios';
import { useShowError } from './ErrorContext';

export function BooksPage() {
  const showError = useShowError();
  const [books, setBooks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [isbn, setIsbn] = useState('');

  useEffect(() => {
    axios
      .get('/api/books')
      .then((res) => {
        setBooks(res.data);
      })
      .catch((err) => {
        showError('Failed to load books: ' + (err.response?.status ?? err.message));
      });
  }, []);

  const submitBook = async (e: any) => {
    e.preventDefault();
    try {
      await axios.post('/api/books', {
        title: title,
        authorId: authorId ? Number(authorId) : undefined,
        isbn: isbn,
      });
      const res = await axios.get('/api/books');
      setBooks(res.data);
    } catch (err: any) {
      showError('Failed to create book: ' + (err.response?.status ?? err.message));
    }
  };

  return (
    <div>
      <section>
        <h2>Create Book</h2>
        <form onSubmit={submitBook}>
          <div>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Author ID"
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="ISBN"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
            />
          </div>
          <button type="submit">Create Book</button>
        </form>
      </section>

      <section>
        <h2>Books</h2>
        <table border={1} cellPadding={6}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>ISBN</th>
              <th>Author</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b: any, i: number) => (
              <tr key={i}>
                <td>{b.id}</td>
                <td>{b.title}</td>
                <td>{b.isbn}</td>
                <td>
                  {b.author
                    ? b.author.firstName + ' ' + b.author.lastName
                    : b.authorId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
