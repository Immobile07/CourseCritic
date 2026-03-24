import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Clock, ArrowLeft, Send } from 'lucide-react';

export default function ForumDetail({ user }) {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopicDetails();
  }, [id]);

  const fetchTopicDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/forums/${id}`);
      setTopic(res.data.topic);
      setAnswers(res.data.answers);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to post an answer.");
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5001/api/forums/${id}/answers`, 
        { content, isAnonymous },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContent('');
      setIsAnonymous(false);
      fetchTopicDetails(); // Refresh answers
    } catch (err) {
      console.error(err);
      alert("Failed to submit answer.");
    }
  };

  if (loading) return <div className="text-center text-muted mt-4">Loading discussion...</div>;
  if (!topic) return <div className="text-center text-muted mt-4">Discussion not found.</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/forum" className="text-muted flex align-center gap-2 mb-4" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
        <ArrowLeft size={14} /> Back to Forums
      </Link>

      <div className="panel animate-fade-in" style={{ borderLeft: '4px solid var(--primary)' }}>
        <div className="panel-header">
          <span style={{ fontSize: '1.25rem' }}>{topic.title}</span>
          <div className="flex gap-4 text-muted" style={{ fontSize: '0.8rem', fontWeight: '400' }}>
            <span className="flex align-center gap-1"><User size={14} /> {topic.author?.username || 'Anonymous'}</span>
            <span className="flex align-center gap-1"><Clock size={14} /> {new Date(topic.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div style={{ fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', padding: '10px 0' }}>
          {topic.content}
        </div>
      </div>

      <h3 className="mb-4" style={{ fontSize: '1.25rem' }}>Replies ({answers.length})</h3>
      
      <div className="flex flex-col gap-4 mb-5">
        {answers.map(ans => (
          <div key={ans._id} className="panel">
            <div className="panel-header" style={{ marginBottom: '12px' }}>
              <span className="flex align-center gap-2" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                <User size={14} /> {ans.author?.username || 'Anonymous'}
              </span>
              <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: '400' }}>
                {new Date(ans.createdAt).toLocaleString()}
              </span>
            </div>
            <div style={{ fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{ans.content}</div>
          </div>
        ))}
        {answers.length === 0 && <p className="text-muted panel text-center">No replies yet.</p>}
      </div>

      <div className="panel">
        <div className="panel-header">Add a Reply</div>
        {user ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea 
              required
              className="input-field" 
              style={{ minHeight: '100px', resize: 'vertical' }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your answer..."
            />
            <div className="flex justify-between align-center">
              <div className="flex align-center gap-2">
                <input 
                  type="checkbox" 
                  id="anon-reply"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <label htmlFor="anon-reply" className="text-muted" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>Reply as Anonymous</label>
              </div>
              <button type="submit" className="btn-primary flex align-center gap-2">
                <Send size={16} /> Post Reply
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted mb-3">Login to participate in the discussion.</p>
            <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Login</Link>
          </div>
        )}
      </div>
    </div>
  );
}
