import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Check, X, Trash2, Flag } from 'lucide-react';

export default function AdminDashboard({ user }) {
  const [unapprovedCourses, setUnapprovedCourses] = useState([]);
  const [reportedReviews, setReportedReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'Admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [coursesRes, reviewsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/admin/courses/unapproved', { headers }),
        axios.get('http://localhost:5001/api/admin/reviews/reported', { headers })
      ]);

      setUnapprovedCourses(coursesRes.data);
      setReportedReviews(reviewsRes.data);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  // Course Actions
  const approveCourse = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/admin/courses/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnapprovedCourses(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert('Error approving course');
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/admin/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnapprovedCourses(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert('Error deleting course');
    }
  };

  // Review Actions
  const dismissReport = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/admin/reviews/${id}/dismiss`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportedReviews(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert('Error dismissing report');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/admin/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportedReviews(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert('Error deleting review');
    }
  };

  if (!user || user.role !== 'Admin') {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '60px 40px', marginTop: '20px' }}>
        <Shield size={48} color="var(--danger)" style={{ marginBottom: '20px' }} />
        <h2>Access Denied</h2>
        <p className="text-muted">You do not have permission to view this page. Admin access required.</p>
      </div>
    );
  }

  if (loading) return <div className="text-center mt-4">Loading Admin Dashboard...</div>;

  return (
    <div>
      <div className="panel mb-4 animate-fade-in" style={{ padding: '32px 40px' }}>
        <div className="flex align-center gap-2 mb-2">
          <Shield size={28} color="var(--primary)" />
          <h1 style={{ margin: 0 }}>Admin Verification Dashboard</h1>
        </div>
        <p className="text-muted">Review pending course listings and moderate flagged user reviews.</p>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '24px' }}>
        {/* Pending Courses Column */}
        <div>
          <h2 className="mb-4">Pending Courses ({unapprovedCourses.length})</h2>
          <div className="flex-col gap-4">
            {unapprovedCourses.length === 0 ? (
              <p className="panel text-muted text-center">No pending courses to approve.</p>
            ) : (
              unapprovedCourses.map(course => (
                <div key={course._id} className="panel">
                  <div className="flex justify-between mb-2">
                    <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{course.courseCode}</strong>
                    <span className="badge badge-cyan">{course.creditHours} Credits</span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem' }}>{course.title}</h3>
                  <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>{course.description}</p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => approveCourse(course._id)}
                      className="btn-primary flex align-center gap-2 justify-center" 
                      style={{ flex: 1, backgroundColor: 'var(--success)' }}
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button 
                      onClick={() => deleteCourse(course._id)}
                      className="btn-secondary flex align-center gap-2 justify-center" 
                      style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Flagged Reviews Column */}
        <div>
          <h2 className="mb-4">Flagged Reviews ({reportedReviews.length})</h2>
          <div className="flex-col gap-4">
            {reportedReviews.length === 0 ? (
              <p className="panel text-muted text-center">No reviews have been flagged.</p>
            ) : (
              reportedReviews.map(review => (
                <div key={review._id} className="panel" style={{ borderLeft: '4px solid var(--danger)' }}>
                  <div className="flex justify-between mb-2 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <strong style={{ display: 'block' }}>{review.course?.courseCode}</strong>
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>Prof: {review.professor?.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block' }}>Author: {review.isAnonymous ? 'Anonymous' : review.author?.username}</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p style={{ fontStyle: 'italic', fontSize: '0.95rem' }}>"{review.writtenFeedback}"</p>
                  </div>

                  <div className="mb-4" style={{ background: 'rgba(239,68,68,0.05)', padding: '10px', borderRadius: '4px' }}>
                    <div className="flex align-center gap-2 mb-1">
                      <Flag size={14} color="var(--danger)" />
                      <strong style={{ fontSize: '0.85rem', color: 'var(--danger)' }}>Reported {review.reports.length} time(s)</strong>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {review.reports.map((report, idx) => (
                        <li key={idx}>{report.reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => dismissReport(review._id)}
                      className="btn-secondary flex align-center gap-2 justify-center" 
                      style={{ flex: 1 }}
                    >
                      <Check size={16} /> Dismiss Flags
                    </button>
                    <button 
                      onClick={() => deleteReview(review._id)}
                      className="btn-primary flex align-center gap-2 justify-center" 
                      style={{ backgroundColor: 'var(--danger)' }}
                    >
                      <Trash2 size={16} /> Delete Review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
