import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function CourseGradingOutline({ gradingScheme }) {
  if (!gradingScheme) return null;

  // Parse the grading scheme and completely filter out any metric that is 0% (like Lab for theory courses)
  const data = [
    { name: 'Attendance', value: gradingScheme.attendance, color: '#6366f1' }, 
    { name: 'Assignments', value: gradingScheme.assignment, color: '#10b981' }, 
    { name: 'Quizzes', value: gradingScheme.quiz, color: '#f59e0b' }, 
    { name: 'Midterm', value: gradingScheme.midterm, color: '#0ea5e9' }, 
    { name: 'Final', value: gradingScheme.final, color: '#ef4444' }, 
    { name: 'Lab', value: gradingScheme.lab, color: '#8b5cf6' }, 
  ].filter(item => item.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="glass-panel mb-5 animate-fade-in">
      <h2 className="mb-4 text-gradient">Official Grading Outline</h2>
      
      <div className="grid grid-cols-2 align-center gap-4">
        {/* Left Column: Clean Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>Component</th>
                <th style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>Weight</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }}></span>
                    {item.name}
                  </td>
                  <td style={{ padding: '10px 8px', fontWeight: 'bold' }}>{item.value}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column: Recharts Doughnut */}
        <div style={{ height: '220px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `${value}%`}
                contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-main)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}