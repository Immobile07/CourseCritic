import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Clock, Star } from 'lucide-react';
import PrerequisiteLinks from '../components/PrerequisiteLinks';

export default function CourseDetail({ user }) {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [facultyId, setFacultyId] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [usefulness, setUsefulness] = useState(3);
  const [workload, setWorkload] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const [courseRes, reviewRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/courses/${id}`),
        axios.get(`http://localhost:5001/api/reviews/course/${id}`)
      ]);
      setCourse(courseRes.data);
      if (courseRes.data.taughtBy.length > 0) setFacultyId(courseRes.data.taughtBy[0]._id);
      setReviews(reviewRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return setError("You must be logged in to review");
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/reviews', {
        courseId: id,
        facultyId: facultyId,
        difficultyRating: difficulty,
        usefulnessRating: usefulness,
        workloadRating: workload,
        writtenFeedback: feedback,
        isAnonymous
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setFeedback('');
      fetchCourseDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting review');
    }
  };

  if (loading) return <div className="text-center mt-4">Loading...</div>;
  if (!course) return <div className="text-center mt-4 text-danger">Course not found</div>;

  return (
    <div>
      <div className="panel mb-4">
        <div className="flex justify-between align-center mb-2">
          <h1 style={{ margin: 0 }}>{course.courseCode}: {course.title}</h1>
          <span className="badge badge-cyan">{course.creditHours} Credits</span>
        </div>
        <p style={{ fontSize: '1.1rem', marginBottom: '20px' }} className="text-muted">{course.description}</p>
        
        <PrerequisiteLinks prerequisites={course.prerequisites} />

        <h3 style={{ marginTop: '20px' }}>Taught By:</h3>
        <div className="flex gap-2 mt-2">
          {course.taughtBy.map(f => (
            <Link key={f._id} to={`/faculty/${f._id}`} style={{ textDecoration: 'none' }}>
              <span className="badge badge-cyan" style={{ padding: '8px 12px', fontSize: '1rem' }}>
                <User size={16}/> {f.name}
              </span>
            </Link>
          ))}
          {course.taughtBy.length === 0 && <span className="text-muted">No faculty listed</span>}
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div>
          <h2 className="mb-4">Student Reviews</h2>
          <div className="flex-col gap-4">
            {reviews.map(review => (
              <div key={review._id} className="panel">
                <div className="flex justify-between mb-2 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <strong>{review.isAnonymous ? 'Anonymous User' : (review.author?.username || 'Unknown')}</strong>
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>Faculty: {review.faculty?.name}</span>
                </div>
                <div className="flex gap-4 mb-2 mt-4">
                  <div className="text-center px-2"><div style={{fontSize: '1.2rem', fontWeight: 800, color: 'var(--danger)'}}>{review.difficultyRating}/5</div><div className="text-muted" style={{fontSize:'0.8rem'}}>Difficulty</div></div>
                  <div className="text-center px-2"><div style={{fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)'}}>{review.usefulnessRating}/5</div><div className="text-muted" style={{fontSize:'0.8rem'}}>Usefulness</div></div>
                  <div className="text-center px-2"><div style={{fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b'}}>{review.workloadRating}/5</div><div className="text-muted" style={{fontSize:'0.8rem'}}>Workload</div></div>
                </div>
                <p className="mt-4" style={{ fontStyle: 'italic', lineHeight: 1.6 }}>"{review.writtenFeedback}"</p>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-muted panel text-center">No reviews yet.</p>}
          </div>
        </div>

        <div>
          <div className="panel" style={{ position: 'sticky', top: '20px' }}>
            <h2 className="mb-4">Leave a Review</h2>
            {!user ? (
               <p className="text-center pt-4 pb-4">Please <Link to="/login" style={{color: 'var(--primary)'}}>login</Link> to review this course.</p>
            ) : (
            <form onSubmit={submitReview} className="flex-col gap-4">
              {error && <div style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}
              <div className="mb-4">
                <label className="text-muted mb-2" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600' }}>FACULTY MEMBER</label>
                <select className="input-field" value={facultyId} onChange={e => setFacultyId(e.target.value)} required>
                  <option value="" disabled style={{color: 'black'}}>Select faculty</option>
                  {course.taughtBy.map(f => (
                    <option key={f._id} value={f._id} style={{color: 'black'}}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between gap-2 mb-4">
                <div className="flex-col" style={{ flex: 1 }}>
                  <label className="text-center text-muted mb-2" style={{ fontSize: '0.75rem' }}>DIFFICULTY</label>
                  <input type="number" min="1" max="5" className="input-field text-center" value={difficulty} onChange={e => setDifficulty(e.target.value)} required />
                </div>
                <div className="flex-col" style={{ flex: 1 }}>
                  <label className="text-center text-muted mb-2" style={{ fontSize: '0.75rem' }}>USEFULNESS</label>
                  <input type="number" min="1" max="5" className="input-field text-center" value={usefulness} onChange={e => setUsefulness(e.target.value)} required />
                </div>
                <div className="flex-col" style={{ flex: 1 }}>
                  <label className="text-center text-muted mb-2" style={{ fontSize: '0.75rem' }}>WORKLOAD</label>
                  <input type="number" min="1" max="5" className="input-field text-center" value={workload} onChange={e => setWorkload(e.target.value)} required />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-muted mb-2" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600' }}>WRITTEN FEEDBACK</label>
                <textarea className="input-field" rows="4" value={feedback} onChange={e => setFeedback(e.target.value)} required placeholder="Share your experience..."></textarea>
              </div>

              <div className="flex align-center gap-2 mb-4">
                <input type="checkbox" id="anon" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
                <label htmlFor="anon" className="text-muted" style={{ fontSize: '0.9rem' }}>Post Anonymously</label>
              </div>

              <button type="submit" className="btn-primary w-100">Submit Review</button>
            </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
