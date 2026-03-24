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
      const res = await axios.get('http://localhost:5001/api/courses');
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
      const res = await axios.get(`http://localhost:5001/api/courses/search?query=${query}`);
      setCourses(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="panel animate-fade-in" style={{ padding: '40px' }}>
        <h1 style={{ marginBottom: '8px' }}>Course Directory</h1>
        <p className="text-muted" style={{ marginBottom: '24px' }}>
          Search for courses, view difficulty ratings, and read student reviews.
        </p>
        
        <form onSubmit={handleSearch} style={{ maxWidth: '100%', position: 'relative' }}>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search by course code (e.g. CS-301) or title..." 
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
          <p className="text-center text-muted" style={{ gridColumn: '1/-1' }}>Loading courses...</p>
        ) : (
          <>
            {courses.map(course => (
              <Link to={`/course/${course._id}`} key={course._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="panel course-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div className="panel-header">
                    <span>{course.courseCode}</span>
                    <span className="badge badge-cyan">{course.creditHours} Credits</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', margin: '0 0 12px 0' }}>{course.title}</h3>
                  <p className="text-muted" style={{ fontSize: '0.9rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description}
                  </p>
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)', textAlign: 'right' }}>
                    <span className="text-primary font-bold" style={{ fontSize: '0.9rem' }}>View Details →</span>
                  </div>
                </div>
              </Link>
            ))}
            {courses.length === 0 && <p className="text-muted" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>No courses found. Try a different search.</p>}
          </>
        )}
      </div>
    </div>
  );
}
