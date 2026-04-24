import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Plus, Trash2, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GPASimulator({ user }) {
  const [planner, setPlanner] = useState([]);
  const [grades, setGrades] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [simulatedGpa, setSimulatedGpa] = useState(null);
  const [totalCredits, setTotalCredits] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const gradeOptions = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

  useEffect(() => {
    if (user) {
      fetchPlanner();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPlanner = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users/planner', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlanner(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch planner');
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return setSearchResults([]);
    try {
      const res = await axios.get(`http://localhost:5000/api/courses/search?query=${searchQuery}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addToPlanner = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/users/planner', { courseId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPlanner();
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromPlanner = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/planner/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPlanner();
      
      const newGrades = { ...grades };
      delete newGrades[courseId];
      setGrades(newGrades);
    } catch (err) {
      console.error(err);
    }
  };

  const simulateGPA = async () => {
    try {
      const token = localStorage.getItem('token');
      const coursesData = planner.map(course => ({
        courseId: course._id,
        grade: grades[course._id] || null
      })).filter(c => c.grade);

      if (coursesData.length === 0) {
        setError('Please select at least one grade to simulate.');
        return;
      }

      setError('');
      const res = await axios.post('http://localhost:5000/api/users/gpa/simulate', { courses: coursesData }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSimulatedGpa(res.data.gpa);
      setTotalCredits(res.data.totalCredits);
    } catch (err) {
      console.error(err);
      setError('Failed to calculate GPA');
    }
  };

  if (!user) {
    return (
      <div className="text-center mt-4">
        <h2>GPA Simulator</h2>
        <p>Please <Link to="/login" style={{color: 'var(--primary)'}}>login</Link> to use the GPA simulator.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-center">
        <h1 className="text-gradient">Dynamic GPA Simulator</h1>
        <p className="text-muted">Plan your courses and calculate your projected weighted GPA.</p>
      </div>

      <div className="grid grid-cols-2">
        <div>
          <div className="glass-panel">
            <h2 className="mb-4">My Planner</h2>
            {loading ? <p>Loading...</p> : (
              <div className="flex-col gap-2">
                {planner.length === 0 && <p className="text-muted">No courses in your planner yet. Add some below!</p>}
                {planner.map(course => (
                  <div key={course._id} className="flex justify-between align-center p-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{course.courseCode}</h4>
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>{course.creditHours} Credits</span>
                    </div>
                    <div className="flex gap-2 align-center">
                      <select 
                        className="input-glass" 
                        style={{ padding: '4px 8px', minWidth: '80px', color: 'black' }}
                        value={grades[course._id] || ''} 
                        onChange={(e) => setGrades({...grades, [course._id]: e.target.value})}
                      >
                        <option value="" disabled style={{color:'black'}}>Grade</option>
                        {gradeOptions.map(g => <option key={g} value={g} style={{color:'black'}}>{g}</option>)}
                      </select>
                      <button onClick={() => removeFromPlanner(course._id)} className="btn-secondary" style={{ padding: '8px', color: '#ef4444', borderColor: '#ef4444' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {planner.length > 0 && (
                  <button onClick={simulateGPA} className="btn-primary mt-4 flex align-center justify-center gap-2 w-full">
                    <Calculator size={18} /> Calculate GPA
                  </button>
                )}
                {error && <div style={{ color: '#ef4444', textAlign: 'center', marginTop: '10px' }}>{error}</div>}
              </div>
            )}
          </div>

          {simulatedGpa !== null && (
            <div className="glass-panel mt-4 text-center animate-fade-in" style={{ borderColor: 'var(--primary)', background: 'linear-gradient(rgba(14, 165, 233, 0.1), transparent)' }}>
              <h2 className="text-muted" style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Projected Weighted GPA</h2>
              <div className="text-gradient" style={{ fontSize: '3rem', fontWeight: 800, margin: '10px 0' }}>{simulatedGpa}</div>
              <p className="text-muted">Based on {totalCredits} credit hours</p>
            </div>
          )}
        </div>

        <div>
          <div className="glass-panel" style={{ position: 'sticky', top: '100px' }}>
            <h2 className="mb-4">Add to Planner</h2>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input 
                type="text" 
                className="input-glass" 
                style={{ flex: 1 }} 
                placeholder="Search by course code or title..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn-primary">Search</button>
            </form>

            <div className="flex-col gap-2">
              {searchResults.map(course => (
                 <div key={course._id} className="glass-panel flex justify-between align-center p-2">
                   <div>
                     <h4 style={{ margin: 0 }}>{course.courseCode}</h4>
                     <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>{course.title}</p>
                   </div>
                   <button 
                      onClick={() => addToPlanner(course._id)} 
                      className="btn-primary flex align-center gap-2"
                      style={{ padding: '6px 12px' }}
                      disabled={planner.some(p => p._id === course._id)}
                    >
                     <Plus size={16} /> {planner.some(p => p._id === course._id) ? 'Added' : 'Add'}
                   </button>
                 </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
