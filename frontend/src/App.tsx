import { useState } from 'react';
import { AuthorsPage } from './AuthorsPage';
import { BooksPage } from './BooksPage';

export function App() {
  const [page, setPage] = useState('authors');

  return (
    <main>
      <h1>Book API</h1>
      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage('authors');
          }}
          style={{ fontWeight: page === 'authors' ? 'bold' : 'normal' }}
        >
          Authors
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage('books');
          }}
          style={{ fontWeight: page === 'books' ? 'bold' : 'normal' }}
        >
          Books
        </a>
      </nav>
      <hr style={{ marginTop: '2rem' }}/>
      {page === 'authors' && <AuthorsPage />}
      {page === 'books' && <BooksPage />}
    </main>
  );
}
