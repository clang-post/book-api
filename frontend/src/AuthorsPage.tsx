import { useEffect, useState } from 'react';
import axios from 'axios';
import { useShowError } from './ErrorContext';

export function AuthorsPage() {
  const showError = useShowError();
  const [authors, setAuthors] = useState<any[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    axios
      .get('/api/authors')
      .then((res) => {
        setAuthors(res.data);
      })
      .catch((err) => {
        showError('Failed to load authors: ' + (err.response?.status ?? err.message));
      });
  }, []);

  const submitAuthor = async (e: any) => {
    e.preventDefault();
    try {
      await axios.post('/api/authors', {
        firstName: firstName,
        lastName: lastName,
        country: country,
      });
      const res = await axios.get('/api/authors');
      setAuthors(res.data);
    } catch (err: any) {
      showError('Failed to create author: ' + (err.response?.status ?? err.message));
    }
  };

  return (
    <div>
      <section>
        <h2>Create Author</h2>
        <form onSubmit={submitAuthor}>
          <div>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
          <button type="submit">Create Author</button>
        </form>
      </section>

      <section>
        <h2>Authors</h2>
        <table border={1} cellPadding={6}>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Country</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((a: any, i: number) => (
              <tr key={i}>
                <td>{a.id}</td>
                <td>{a.firstName}</td>
                <td>{a.lastName}</td>
                <td>{a.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
