import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Book, Clock } from 'lucide-react';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/courses');
      setCourses(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };



  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return fetchCourses();
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/courses/search?query=${query}`);
      setCourses(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-4 glass-panel" style={{ padding: '60px 20px', background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem' }}>Find Your Perfect Schedule</h1>
        <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 30px auto' }}>
          Discover course difficulty, usefulness, and workload before you enroll based on real student experiences.
        </p>
        
        <form onSubmit={handleSearch} style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search by course code (e.g. CS-301) or title..." 
            className="input-glass"
            style={{ padding: '16px 24px', paddingRight: '50px', fontSize: '1.1rem', borderRadius: '50px' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" style={{ position: 'absolute', right: '8px', top: '8px', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '8px' }}>
            <Search size={24} />
          </button>
        </form>
      </div>

      <h2 className="mt-5 mb-4">Course Directory</h2>
      {loading ? (
        <p className="text-center text-muted">Loading courses...</p>
      ) : (
        <div className="grid grid-cols-3">
          {courses.map(course => (
            <Link to={`/course/${course._id}`} key={course._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-panel course-card h-100 flex-col justify-between" style={{ height: '100%' }}>
                <div>
                  <div className="flex justify-between align-center mb-2">
                    <h3 className="text-gradient" style={{ margin: 0 }}>{course.courseCode}</h3>
                    <span className="badge badge-primary"><Clock size={14}/> {course.creditHours} Credits</span>
                  </div>
                  <h4 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>{course.title}</h4>
                  <p className="text-muted" style={{ fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description}
                  </p>
                </div>
                <div className="mt-4 pt-4 flex gap-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <span className="badge badge-success"><Book size={14}/> View details</span>
                </div>
              </div>
            </Link>
          ))}
          {courses.length === 0 && <p className="text-muted" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>No courses found. Try a different search.</p>}
        </div>
      )}
    </div>
  );
}
