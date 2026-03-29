import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Trash2, Book, Clock } from 'lucide-react';

export default function Planner({ user }) {
  const [plannedCourses, setPlannedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchPlanner();
    else setLoading(false);
  }, [user]);

  const fetchPlanner = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5001/api/planner', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlannedCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromPlanner = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/planner/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlannedCourses(prev => prev.filter(c => c._id !== courseId));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="panel animate-fade-in" style={{ textAlign: 'center', padding: '60px 40px' }}>
        <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '20px' }} />
        <h2 style={{ marginBottom: '10px' }}>Your Course Planner</h2>
        <p className="text-muted" style={{ marginBottom: '24px' }}>
          Please <Link to="/login" style={{ color: 'var(--primary)' }}>log in</Link> to view and manage your planned courses.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="panel animate-fade-in" style={{ padding: '32px 40px', marginBottom: '24px' }}>
        <div className="flex align-center gap-2" style={{ marginBottom: '8px' }}>
          <BookOpen size={28} color="var(--primary)" />
          <h1 style={{ margin: 0 }}>My Course Planner</h1>
        </div>
        <p className="text-muted">Courses you've bookmarked to take in a future semester.</p>
      </div>

      {loading ? (
        <p className="text-muted" style={{ textAlign: 'center' }}>Loading your planner...</p>
      ) : plannedCourses.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <Book size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>No courses saved yet</h3>
          <p className="text-muted" style={{ marginBottom: '20px' }}>
            Browse courses and click <strong style={{ color: 'var(--primary)' }}>Add to Planner</strong> to bookmark them here.
          </p>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3">
          {plannedCourses.map(course => (
            <div key={course._id} className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="panel-header">
                <span>{course.courseCode}</span>
                <span className="badge badge-cyan">{course.creditHours} Credits</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 10px 0', flex: 1 }}>{course.title}</h3>
              <p className="text-muted" style={{
                fontSize: '0.88rem',
                marginBottom: '16px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {course.description}
              </p>
              <div className="flex align-center gap-2" style={{ marginBottom: '12px' }}>
                <Clock size={14} color="var(--text-muted)" />
                <span className="text-muted" style={{ fontSize: '0.82rem' }}>Dept: {course.department}</span>
              </div>
              <div className="flex gap-2" style={{ marginTop: 'auto' }}>
                <Link
                  to={`/course/${course._id}`}
                  className="btn-secondary"
                  style={{ textDecoration: 'none', flex: 1, textAlign: 'center', padding: '7px 12px', fontSize: '0.85rem' }}
                >
                  View Course
                </Link>
                <button
                  onClick={() => removeFromPlanner(course._id)}
                  title="Remove from planner"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '4px',
                    padding: '7px 10px',
                    cursor: 'pointer',
                    color: 'var(--danger)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
