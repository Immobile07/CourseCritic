import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Book, Clock, Mail, MapPin } from 'lucide-react';

export default function FacultyProfile() {
  const { id } = useParams();
  const [faculty, setFaculty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaculty();
  }, [id]);

  const fetchFaculty = async () => {
    try {
      const [res, reviewsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/faculty/${id}`),
        axios.get(`http://localhost:5000/api/reviews/professor/${id}`)
      ]);
      setFaculty(res.data);
      setReviews(reviewsRes.data);
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
        <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>{faculty.department} Department</p>
        <div className="flex justify-center gap-4 text-muted">
          <div className="flex align-center gap-2">
            <Mail size={16} /> <span>{faculty.email || 'Not Provided'}</span>
          </div>
          <div className="flex align-center gap-2">
            <MapPin size={16} /> <span>{faculty.deskNumber || 'Not Provided'}</span>
          </div>
        </div>
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

      <h2 className="mb-4 mt-5">Student Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-muted panel text-center">No reviews yet for this faculty member.</p>
      ) : (
        <div className="flex-col gap-4">
          {reviews.map(review => (
            <div key={review._id} className="glass-panel">
              <div className="flex justify-between mb-2 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <strong>{review.isAnonymous ? 'Anonymous User' : (review.author?.username || 'Unknown')}</strong>
                <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                  Course: <Link to={`/course/${review.course?._id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{review.course?.courseCode}</Link>
                </span>
              </div>
              <div className="flex gap-4 mb-2 mt-4">
                <div className="text-center px-2"><div style={{fontSize: '1.2rem', fontWeight: 800, color: '#ef4444'}}>{review.difficultyRating}/5</div><div className="text-muted" style={{fontSize:'0.8rem'}}>Difficulty</div></div>
                <div className="text-center px-2"><div style={{fontSize: '1.2rem', fontWeight: 800, color: '#10b981'}}>{review.usefulnessRating}/5</div><div className="text-muted" style={{fontSize:'0.8rem'}}>Usefulness</div></div>
                <div className="text-center px-2"><div style={{fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b'}}>{review.workloadRating}/5</div><div className="text-muted" style={{fontSize:'0.8rem'}}>Workload</div></div>
              </div>
              <p className="mt-4" style={{ fontStyle: 'italic', lineHeight: 1.6 }}>"{review.writtenFeedback}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
