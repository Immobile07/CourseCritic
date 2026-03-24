import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, User } from 'lucide-react';

export default function FacultyList() {
  const [faculty, setFaculty] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/faculty');
      setFaculty(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return fetchFaculty();
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5001/api/faculty/search?query=${query}`);
      setFaculty(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="panel animate-fade-in" style={{ padding: '40px' }}>
        <h1 style={{ marginBottom: '8px' }}>Faculty Directory</h1>
        <p className="text-muted" style={{ marginBottom: '24px' }}>
          Search for faculty members and read real reviews from students.
        </p>

        <form onSubmit={handleSearch} style={{ maxWidth: '100%', position: 'relative' }}>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search by name or department..." 
              className="input-field"
              style={{ flex: 1 }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn-primary flex align-center gap-2">
              <Search size={18} /> Search
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-3">
        {loading ? (
          <p className="text-center text-muted" style={{ gridColumn: '1/-1' }}>Loading faculty...</p>
        ) : (
          <>
            {faculty.map(f => (
              <Link to={`/faculty/${f._id}`} key={f._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="panel course-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div className="panel-header">
                    <span>{f.name}</span>
                    <span className="badge badge-cyan">{f.department}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                      View faculty profile and ratings.
                    </p>
                  </div>
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)', textAlign: 'right' }}>
                    <span className="text-primary font-bold" style={{ fontSize: '0.9rem' }}>View Profile →</span>
                  </div>
                </div>
              </Link>
            ))}
            {faculty.length === 0 && <p className="text-muted" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>No faculty members found.</p>}
          </>
        )}
      </div>
    </div>
  );
}
