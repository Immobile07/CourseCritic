import React from 'react';
import { Link } from 'react-router-dom';

const PrerequisiteLinks = ({ prerequisites }) => {
  if (!prerequisites || prerequisites.length === 0) return null;

  return (
    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--surface)', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Prerequisites</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {prerequisites.map((code, index) => (
          <Link 
            key={index}
            to={`/course/code/${code}`}
            style={{ padding: '4px 12px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border)', borderRadius: '4px', textDecoration: 'none', color: 'var(--primary)', fontWeight: '500' }}
          >
            {code}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PrerequisiteLinks;
