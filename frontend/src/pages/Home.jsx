import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Book, Clock } from 'lucide-react';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [topElectives, setTopElectives] = useState([]);
  const [electivesLoading, setElectivesLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
    fetchTopElectives();
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

  const fetchTopElectives = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/courses/top-electives');
      setTopElectives(res.data);
      setElectivesLoading(false);
    } catch (err) {
      console.error(err);
      setElectivesLoading(false);
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

      <h2 className="mt-4 mb-4 text-gradient" style={{ fontSize: '2rem' }}>⭐ Top Rated Electives</h2>
      {electivesLoading ? (
        <p className="text-center text-muted">Loading top electives...</p>
      ) : topElectives.length > 0 ? (
        <div className="grid grid-cols-3 mb-5">
          {topElectives.map(item => (
            <Link to={`/course/${item._id}`} key={item._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-panel" style={{ height: '100%', border: '1px solid rgba(99, 102, 241, 0.3)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, transparent 100%)' }}>
                <div className="flex justify-between align-center mb-2">
                  <h3 style={{ margin: 0 }}>{item.courseData.courseCode}</h3>
                  <div className="text-gradient" style={{ fontWeight: 800, fontSize: '1.2rem' }}>⭐ {(item.avgUsefulness).toFixed(1)}/5</div>
                </div>
                <h4 className="mb-2">{item.courseData.title}</h4>
                <p className="text-muted" style={{ fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.courseData.description}
                </p>
                <div className="mt-3 pt-3 flex justify-between align-center" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <span className="badge badge-primary">{item.courseData.creditHours} Credits</span>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Avg Usefulness</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
         <p className="text-muted" style={{ marginBottom: '40px' }}>No rated electives found. Be the first to review!</p>
      )}

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
