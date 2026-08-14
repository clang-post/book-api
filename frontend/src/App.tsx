import { useState } from 'react';
import { AuthorsPage } from './AuthorsPage';
import { BooksPage } from './BooksPage';
import { ErrorContext } from './ErrorContext';

export function App() {
  const [page, setPage] = useState('authors');
  const [error, setError] = useState<string | null>(null);

  return (
    <ErrorContext.Provider value={setError}>
      <main>
        {error && (
          <div
            role="alert"
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              border: '1px solid #b00020',
              background: '#fdecea',
              color: '#611a15',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#611a15',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ×
            </button>
          </div>
        )}

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
    </ErrorContext.Provider>
  );
}
