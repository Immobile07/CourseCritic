import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';

const CourseDetailByCode = () => {
  const { code } = useParams();
  const [courseId, setCourseId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5001/api/advanced/course/${code}`)
      .then(res => res.json())
      .then(data => {
        if (data._id) {
          setCourseId(data._id);
        } else {
          setError('Course not found');
        }
      })
      .catch(err => setError(err.message));
  }, [code]);

  if (error) return <div style={{ padding: '1rem' }}>{error}</div>;
  if (!courseId) return <div style={{ padding: '1rem' }}>Resolving course link...</div>;

  return <Navigate to={`/course/${courseId}`} replace />;
};

export default CourseDetailByCode;
