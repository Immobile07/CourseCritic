import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { GitBranch, BookOpen, Link2, FileText, Upload, Download, Trash2, ExternalLink, ChevronLeft, RefreshCw, User, Plus } from 'lucide-react';

const API = 'http://localhost:5000/api';

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TYPE_META = {
  link: { icon: <Link2 size={16} />, label: 'Link',  color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  pdf:  { icon: <FileText size={16} />, label: 'PDF', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  file: { icon: <Upload size={16} />, label: 'File',  color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
};


// --- ResourceUploader Component ---
function ResourceUploader({ courseId, onUploaded }) {
  const [type, setType] = useState('link');
  const [title, setTitle] = useState('');
  const [description, setDesc] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!title.trim() || (type === 'link' && !url.trim()) || ((type === 'pdf' || type === 'file') && !file)) return setError('Please fill all required fields');
    setLoading(true);
    try {
      let res;
      if (type === 'link') res = await axios.post(`${API}/features/history/${courseId}/resources`, { title, description, resourceType: 'link', url }, { headers });
      else {
        const formData = new FormData();
        formData.append('title', title); formData.append('description', description); formData.append('resourceType', type); formData.append('file', file);
        res = await axios.post(`${API}/features/history/${courseId}/resources`, formData, { headers });
      }
      setTitle(''); setDesc(''); setUrl(''); setFile(null);
      if (onUploaded) onUploaded(res.data);
    } catch (err) { setError(err.response?.data?.error || 'Upload failed'); } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {['link', 'pdf', 'file'].map(t => <button key={t} type="button" onClick={() => { setType(t); setFile(null); setUrl(''); }} style={{ flex: 1, padding: '8px', background: type === t ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.2)' }}>{t.toUpperCase()}</button>)}
      </div>
      <input className="input-glass" placeholder="Resource title *" value={title} onChange={e => setTitle(e.target.value)} required />
      <input className="input-glass" placeholder="Short description" value={description} onChange={e => setDesc(e.target.value)} />
      {type === 'link' ? <input className="input-glass" placeholder="https://…" value={url} onChange={e => setUrl(e.target.value)} type="url" required /> : <div><input type="file" accept={type === 'pdf' ? 'application/pdf' : '*'} onChange={e => setFile(e.target.files[0])} /></div>}
      {error && <div style={{ color: '#ef4444' }}>{error}</div>}
      <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Uploading…' : 'Share Resource'}</button>
    </form>
  );
}

// --- MAIN PAGE ---
export default function CourseHistory({ user }) {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [resources, setResources] = useState([]);
  const [tab, setTab] = useState('history');
  const [loading, setLoading] = useState(true);
  const [resLoading, setResLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  useEffect(() => {
    if (courseId) {
      axios.get(`${API}/courses/${courseId}`).then(res => setCourse(res.data)).catch(console.error);
      fetchResources();
    }
  }, [courseId]);

  const fetchResources = () => { setResLoading(true); axios.get(`${API}/features/history/${courseId}/resources`).then(res => setResources(res.data)).finally(() => setResLoading(false)); };

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Delete this resource?')) return;
    try { await axios.delete(`${API}/features/history/${courseId}/resources/${resourceId}`, { headers }); setResources(prev => prev.filter(r => r._id !== resourceId)); } catch (e) { alert('Delete failed'); }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Link to={`/course/${courseId}`} style={{ color: 'var(--text-muted)' }}><ChevronLeft size={16} /> Back</Link>
      <div className="glass-panel" style={{ marginBottom: '24px', marginTop: '16px' }}>
        <h1 style={{ margin: 0 }}>{course ? `${course.courseCode} — ${course.title}` : 'Loading…'}</h1>
        <p className="text-muted">History & Resources</p>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
        <button onClick={() => setTab('history')} style={{ flex: 1, padding: '10px', background: tab === 'history' ? 'var(--primary)' : 'transparent', color: tab === 'history' ? 'white' : 'var(--text-muted)' }}>Version History</button>
        <button onClick={() => setTab('resources')} style={{ flex: 1, padding: '10px', background: tab === 'resources' ? 'var(--primary)' : 'transparent', color: tab === 'resources' ? 'white' : 'var(--text-muted)' }}>Resources ({resources.length})</button>
      </div>

      {tab === 'history' && (
        <div className="glass-panel">
          <h2 style={{ marginBottom: '16px' }}>Upload History</h2>
          {resLoading ? (
            <p>Loading...</p>
          ) : resources.length > 0 ? (
            <div style={{ padding: '20px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Last file submitted:</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#10b981' }}>
                {new Date(resources[0].createdAt).toLocaleString()}
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                Resource: <strong>{resources[0].title}</strong> by {resources[0].uploadedBy?.username || 'Unknown'}
              </div>
            </div>
          ) : (
            <p className="text-muted">No resources have been submitted yet.</p>
          )}
        </div>
      )}

      {tab === 'resources' && (
        <div>
          {user && (
            <div className="glass-panel" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2>Share a Resource</h2>
                <button onClick={() => setShowUploader(!showUploader)} className="btn-primary">{showUploader ? 'Cancel' : 'Upload'}</button>
              </div>
              {showUploader && <div style={{ marginTop: '20px' }}><ResourceUploader courseId={courseId} onUploaded={r => { setResources([r, ...resources]); setShowUploader(false); }} /></div>}
            </div>
          )}
          <div className="glass-panel">
            <h2>All Resources</h2>
            {resLoading ? <p>Loading...</p> : resources.length === 0 ? <p>No resources yet.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {resources.map(r => {
                  const meta = TYPE_META[r.resourceType] || TYPE_META.file;
                  return (
                    <div key={r._id} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 16px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{r.title}</div>
                        {r.description && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{r.description}</div>}
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>by {r.uploadedBy?.username} | {new Date(r.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a href={r.resourceType === 'link' ? r.url : `${API.replace('/api', '')}/uploads/${r.filePath?.split(/[/\\]/).pop()}`} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 12px', background: meta.bg, color: meta.color, borderRadius: '8px' }}>{r.resourceType === 'link' ? 'Open' : 'Download'}</a>
                        {user && r.uploadedBy?._id === user._id && <button onClick={() => handleDelete(r._id)} style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><Trash2 size={14} /></button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
