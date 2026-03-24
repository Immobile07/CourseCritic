import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, Clock, User } from 'lucide-react';

export default function ForumList({ user }) {
  const [topics, setTopics] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/forums');
      setTopics(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to post a topic.");
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/forums', 
        { title, content, isAnonymous },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setContent('');
      setIsAnonymous(false);
      fetchTopics(); // Refresh list
    } catch (err) {
      console.error(err);
      alert("Failed to create topic.");
    }
  };

  return (
    <div>
      <div className="panel animate-fade-in" style={{ padding: '30px', borderLeft: '4px solid var(--primary)' }}>
        <h1 style={{ marginBottom: '4px' }}>Student Forums</h1>
        <p className="text-muted">
          Ask questions and share knowledge with your peers.
        </p>
      </div>

      <div className="flex gap-4" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: '1' }}>
          <h2 className="mb-4">Recent Discussions</h2>
          {loading ? (
            <p className="text-muted">Loading topics...</p>
          ) : (
            <div className="flex flex-col gap-3">
              {topics.map(topic => (
                <Link to={`/forum/${topic._id}`} key={topic._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="panel" style={{ transition: 'border-color 0.2s', cursor: 'pointer' }}>
                    <div className="panel-header" style={{ marginBottom: '10px' }}>
                      <span>{topic.title}</span>
                      <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: '400' }}>
                        {new Date(topic.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted" style={{ margin: '0 0 10px 0', fontSize: '0.95rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {topic.content}
                    </p>
                    <div className="flex gap-4 text-muted" style={{ fontSize: '0.85rem' }}>
                      <span className="flex align-center gap-1"><User size={14} /> {topic.author?.username || 'Anonymous'}</span>
                      <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>Discussion</span>
                    </div>
                  </div>
                </Link>
              ))}
              {topics.length === 0 && <p className="text-muted">No topics yet. Be the first to start a discussion!</p>}
            </div>
          )}
        </div>

        <div style={{ width: '300px', flexShrink: 0 }}>
          {user ? (
            <div className="panel">
              <div className="panel-header">New Discussion</div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600' }}>TITLE</label>
                  <input 
                    type="text" 
                    required
                    className="input-field" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Topic title..."
                  />
                </div>
                <div>
                  <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600' }}>CONTENT</label>
                  <textarea 
                    required
                    className="input-field" 
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Details..."
                  />
                </div>
                <div className="flex align-center gap-2">
                  <input 
                    type="checkbox" 
                    id="anon-post"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <label htmlFor="anon-post" className="text-muted" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>Post Anonymously</label>
                </div>
                <button type="submit" className="btn-primary w-100 mt-2 flex justify-center align-center gap-2">
                  <MessageSquare size={16} /> Post Topic
                </button>
              </form>
            </div>
          ) : (
            <div className="panel" style={{ textAlign: 'center' }}>
              <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>Log in to post.</p>
              <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'block' }}>Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
