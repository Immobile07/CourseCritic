import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { User, Search } from 'lucide-react';

export default function Professors() {
  const [professors, setProfessors] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfessors();
  }, []);

  const fetchProfessors = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/professors');
      setProfessors(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const filteredProfessors = professors.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.department.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="text-center mb-4 glass-panel" style={{ padding: '60px 20px', background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%)' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem' }}>Professor Directory</h1>
        <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 30px auto' }}>
          Find professors and explore the courses they teach.
        </p>
        
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search by professor name or department..." 
            className="input-glass"
            style={{ padding: '16px 24px', paddingRight: '50px', fontSize: '1.1rem', borderRadius: '50px' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div style={{ position: 'absolute', right: '16px', top: '16px', color: 'var(--primary)' }}>
            <Search size={24} />
          </div>
        </div>
      </div>

      <h2 className="mt-4 mb-4">All Professors</h2>
      {loading ? (
        <p className="text-center text-muted">Loading professors...</p>
      ) : (
        <div className="grid grid-cols-3">
          {filteredProfessors.map(professor => (
            <Link to={`/professor/${professor._id}`} key={professor._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-panel course-card h-100 flex-col justify-between" style={{ height: '100%', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ background: 'var(--surface-color)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <User size={32} color="var(--primary)" />
                  </div>
                  <h3 className="text-gradient" style={{ margin: '0 0 8px 0' }}>{professor.name}</h3>
                  <span className="badge badge-primary">{professor.department}</span>
                </div>
                <div className="mt-4 pt-4 flex gap-2 justify-center" style={{ borderTop: '1px solid var(--border-color)', width: '100%' }}>
                  <span className="badge badge-success">View Profile</span>
                </div>
              </div>
            </Link>
          ))}
          {filteredProfessors.length === 0 && <p className="text-muted" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>No professors found.</p>}
        </div>
      )}
    </div>
  );
}
