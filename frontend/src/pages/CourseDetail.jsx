import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Clock, Star } from 'lucide-react';

export default function CourseDetail({ user }) {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [profId, setProfId] = useState('');
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
        axios.get(`http://localhost:5000/api/courses/${id}`),
        axios.get(`http://localhost:5000/api/reviews/course/${id}`)
      ]);
      setCourse(courseRes.data);
      if (courseRes.data.taughtBy.length > 0) setProfId(courseRes.data.taughtBy[0]._id);
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
      await axios.post('http://localhost:5000/api/reviews', {
        courseId: id,
        professorId: profId,
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

  const profStats = {};
  reviews.forEach(review => {
    const prof = review.professor;
    if (!prof) return;
    const pId = prof._id;
    if (!profStats[pId]) {
      profStats[pId] = {
        name: prof.name,
        count: 0,
        difficulty: 0,
        usefulness: 0,
        workload: 0,
      };
    }
    profStats[pId].count++;
    profStats[pId].difficulty += review.difficultyRating;
    profStats[pId].usefulness += review.usefulnessRating;
    profStats[pId].workload += review.workloadRating;
  });

  const profAverages = Object.values(profStats).map(p => ({
    name: p.name,
    count: p.count,
    difficulty: (p.difficulty / p.count).toFixed(1),
    usefulness: (p.usefulness / p.count).toFixed(1),
    workload: (p.workload / p.count).toFixed(1)
  })).sort((a, b) => b.usefulness - a.usefulness);

  return (
    <div>
      <div className="glass-panel mb-4">
        <div className="flex justify-between align-center mb-2">
          <h1 className="text-gradient" style={{ margin: 0 }}>{course.courseCode}: {course.title}</h1>
          <span className="badge badge-primary"><Clock size={16}/> {course.creditHours} Credits</span>
        </div>
        <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>{course.description}</p>
        
        <h3>Taught By:</h3>
        <div className="flex gap-2 mt-2">
          {course.taughtBy.map(prof => (
            <Link key={prof._id} to={`/professor/${prof._id}`} style={{ textDecoration: 'none' }}>
              <span className="badge badge-success" style={{ padding: '8px 12px', fontSize: '1rem' }}>
                <User size={16}/> {prof.name}
              </span>
            </Link>
          ))}
          {course.taughtBy.length === 0 && <span className="text-muted">No professors listed</span>}
        </div>

        {course.prerequisites && course.prerequisites.length > 0 && (
          <>
            <h3 className="mt-4">Prerequisites:</h3>
            <div className="flex gap-2 mt-2">
              {course.prerequisites.map(prereq => (
                <Link key={prereq._id} to={`/course/${prereq._id}`} style={{ textDecoration: 'none' }}>
                  <span className="badge badge-primary" style={{ padding: '8px 12px', fontSize: '1rem' }}>
                    {prereq.courseCode}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2">
        <div>
          {profAverages.length > 0 && (
            <div className="mb-5">
              <h2 className="mb-4 text-gradient">Professor Breakdown</h2>
              <div className="flex-col gap-3">
                {profAverages.map((prof, index) => (
                  <div key={prof.name} className="glass-panel" style={{ borderLeft: index === 0 ? '4px solid #10b981' : '1px solid var(--border-color)', background: index === 0 ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)' : 'var(--glass-bg)' }}>
                    <div className="flex justify-between align-center mb-2">
                      <h4 style={{ margin: 0 }}>{prof.name} {index === 0 && '🏆'}</h4>
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>Based on {prof.count} review{prof.count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="text-center p-2" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <div style={{color: '#ef4444', fontWeight: 600}}>{prof.difficulty}</div>
                        <div className="text-muted" style={{fontSize: '0.7rem'}}>Avg Difficulty</div>
                      </div>
                      <div className="text-center p-2" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <div style={{color: '#10b981', fontWeight: 600}}>{prof.usefulness}</div>
                        <div className="text-muted" style={{fontSize: '0.7rem'}}>Avg Usefulness</div>
                      </div>
                      <div className="text-center p-2" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <div style={{color: '#f59e0b', fontWeight: 600}}>{prof.workload}</div>
                        <div className="text-muted" style={{fontSize: '0.7rem'}}>Avg Workload</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h2 className="mb-4">Student Reviews</h2>
          <div className="flex-col gap-4">
            {reviews.map(review => (
              <div key={review._id} className="glass-panel">
                <div className="flex justify-between mb-2 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <strong>{review.isAnonymous ? 'Anonymous User' : (review.author?.username || 'Unknown')}</strong>
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>Prof: {review.professor?.name}</span>
                </div>
                <div className="flex gap-4 mb-2 mt-4">
                  <div className="text-center px-2"><div style={{fontSize: '1.2rem', fontWeight: 800, color: '#ef4444'}}>{review.difficultyRating}/5</div><div className="text-muted" style={{fontSize:'0.8rem'}}>Difficulty</div></div>
                  <div className="text-center px-2"><div style={{fontSize: '1.2rem', fontWeight: 800, color: '#10b981'}}>{review.usefulnessRating}/5</div><div className="text-muted" style={{fontSize:'0.8rem'}}>Usefulness</div></div>
                  <div className="text-center px-2"><div style={{fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b'}}>{review.workloadRating}/5</div><div className="text-muted" style={{fontSize:'0.8rem'}}>Workload</div></div>
                </div>
                <p className="mt-4" style={{ fontStyle: 'italic', lineHeight: 1.6 }}>"{review.writtenFeedback}"</p>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-muted">No reviews yet. Be the first!</p>}
          </div>
        </div>

        <div>
          <div className="glass-panel" style={{ position: 'sticky', top: '100px' }}>
            <h2 className="mb-4 text-gradient">Leave a Review</h2>
            {!user ? (
               <p className="text-center pt-4 pb-4">Please <Link to="/login" style={{color: 'var(--primary)'}}>login</Link> to review this course.</p>
            ) : (
            <form onSubmit={submitReview} className="flex-col gap-4">
              {error && <div style={{ color: '#ef4444', textAlign: 'center' }}>{error}</div>}
              <div>
                <label className="text-muted mb-2" style={{ display: 'block' }}>Professor</label>
                <select className="input-glass" value={profId} onChange={e => setProfId(e.target.value)} required>
                  <option value="" disabled style={{color: 'black'}}>Select a professor</option>
                  {course.taughtBy.map(prof => (
                    <option key={prof._id} value={prof._id} style={{color: 'black'}}>{prof.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between gap-2">
                <div className="flex-col" style={{ flex: 1 }}>
                  <label className="text-center text-muted mb-2">Difficulty</label>
                  <input type="number" min="1" max="5" className="input-glass text-center" value={difficulty} onChange={e => setDifficulty(e.target.value)} required />
                </div>
                <div className="flex-col" style={{ flex: 1 }}>
                  <label className="text-center text-muted mb-2">Usefulness</label>
                  <input type="number" min="1" max="5" className="input-glass text-center" value={usefulness} onChange={e => setUsefulness(e.target.value)} required />
                </div>
                <div className="flex-col" style={{ flex: 1 }}>
                  <label className="text-center text-muted mb-2">Workload</label>
                  <input type="number" min="1" max="5" className="input-glass text-center" value={workload} onChange={e => setWorkload(e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="text-muted mb-2" style={{ display: 'block' }}>Written Feedback</label>
                <textarea className="input-glass" rows="4" value={feedback} onChange={e => setFeedback(e.target.value)} required placeholder="Share your experience..."></textarea>
              </div>

              <div className="flex align-center gap-2">
                <input type="checkbox" id="anon" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
                <label htmlFor="anon">Post Anonymously</label>
              </div>

              <button type="submit" className="btn-primary mt-2">Submit Review</button>
            </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
