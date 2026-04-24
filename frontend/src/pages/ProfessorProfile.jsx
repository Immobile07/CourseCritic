import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Book, Clock } from 'lucide-react';

export default function ProfessorProfile() {
  const { id } = useParams();
  const [professor, setProfessor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfessor();
  }, [id]);

  const fetchProfessor = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/professors/${id}`);
      setProfessor(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-4">Loading...</div>;
  if (!professor) return <div className="text-center mt-4" style={{ color: 'var(--danger)' }}>Professor not found</div>;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="glass-panel text-center mb-4">
        <h1 className="text-gradient mb-2">{professor.name}</h1>
        <p className="text-muted" style={{ fontSize: '1.2rem' }}>Department: {professor.department}</p>
      </div>

      <h2 className="mb-4">Courses Taught</h2>
      {professor.coursesTaught.length === 0 ? (
        <p className="text-muted text-center glass-panel">No courses listed for this professor.</p>
      ) : (
        <div className="grid grid-cols-2">
          {professor.coursesTaught.map(course => (
            <Link key={course._id} to={`/course/${course._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-panel course-card flex-col justify-between" style={{ height: '100%' }}>
                <div>
                  <div className="flex justify-between align-center mb-2">
                    <h3 className="text-gradient" style={{ margin: 0 }}>{course.courseCode}</h3>
                    <span className="badge badge-primary"><Clock size={14}/> {course.creditHours} Cr</span>
                  </div>
                  <h4 style={{ marginBottom: '12px' }}>{course.title}</h4>
                </div>
                <div className="mt-4 pt-4 flex gap-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <span className="badge badge-success"><Book size={14}/> View details</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
