import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Book, Clock } from 'lucide-react';

export default function FacultyProfile() {
  const { id } = useParams();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaculty();
  }, [id]);

  const fetchFaculty = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/faculty/${id}`);
      setFaculty(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-4">Loading...</div>;
  if (!faculty) return <div className="text-center mt-4 panel" style={{ color: 'var(--danger)' }}>Faculty member not found</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="panel animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '8px' }}>{faculty.name}</h1>
        <p className="text-muted" style={{ fontSize: '1.1rem' }}>{faculty.department} Department</p>
      </div>

      <h2 className="mb-4">Courses Taught</h2>
      {faculty.coursesTaught.length === 0 ? (
        <p className="text-muted panel text-center">No courses listed for this faculty member.</p>
      ) : (
        <div className="grid grid-cols-3">
          {faculty.coursesTaught.map(course => (
            <Link key={course._id} to={`/course/${course._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="panel course-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header">
                  <span>{course.courseCode}</span>
                  <span className="badge badge-cyan">{course.creditHours} Credits</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', margin: '0 0 12px 0' }}>{course.title}</h3>
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)', textAlign: 'right' }}>
                  <span className="text-primary font-bold" style={{ fontSize: '0.9rem' }}>View Details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
