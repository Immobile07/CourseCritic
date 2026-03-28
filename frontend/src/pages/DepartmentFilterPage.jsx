import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter } from 'lucide-react';

const DepartmentFilterPage = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5001/api/advanced/departments')
      .then(res => res.json())
      .then(data => {
        setDepartments(data);
        if (data.length > 0) setSelectedDept(data[0]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedDept) return;
    setLoading(true);
    fetch(`http://localhost:5001/api/advanced/departments/${selectedDept}`)
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        setLoading(false);
      });
  }, [selectedDept]);

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Filter size={24} color="var(--primary)" />
        <h1 style={{ margin: 0 }}>Browse by Department</h1>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Select Major/Department:</label>
        <select 
          value={selectedDept} 
          onChange={(e) => setSelectedDept(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-main)' }}
        >
          {departments.map((dept, i) => (
            <option key={i} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading courses...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {courses.length === 0 ? <p>No courses found for this department.</p> : courses.map(course => (
            <Link key={course._id} to={`/course/${course._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', height: '100%' }}>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary)' }}>{course.courseCode}</h3>
                <h4 style={{ margin: '0 0 8px 0' }}>{course.title}</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{course.creditHours} Credits</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentFilterPage;
