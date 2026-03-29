import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

/**
 * Simulates a grade distribution from the difficulty ratings of reviews.
 * High difficulty → more C/Ds, Low difficulty → more As/Bs.
 */
function computeGradeDistribution(reviews) {
  if (!reviews || reviews.length === 0) return null;

  const avgDifficulty = reviews.reduce((sum, r) => sum + r.difficultyRating, 0) / reviews.length;

  // Map avgDifficulty (1–5) to grade distributions
  // At difficulty 1 → mostly As; at difficulty 5 → mostly Cs/Fs
  const difficulty = avgDifficulty; // 1 to 5

  const aRate = Math.max(5, Math.round(55 - (difficulty - 1) * 10));
  const fRate = Math.max(2, Math.round((difficulty - 1) * 7));
  const cRate = Math.max(5, Math.round(10 + (difficulty - 1) * 5));
  const bRate = Math.max(5, 100 - aRate - cRate - fRate);

  return [
    { grade: 'A', percent: aRate, color: '#10b981' },
    { grade: 'B', percent: bRate, color: '#06b6d4' },
    { grade: 'C', percent: cRate, color: '#f59e0b' },
    { grade: 'F', percent: fRate, color: '#ef4444' },
  ];
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '6px',
        padding: '10px 14px',
        color: '#f8fafc',
        fontSize: '0.9rem'
      }}>
        <strong>Grade {label}</strong>
        <div style={{ color: payload[0].fill, marginTop: 4 }}>
          {payload[0].value}% of students
        </div>
      </div>
    );
  }
  return null;
};

export default function GradeDistributionChart({ reviews }) {
  const data = computeGradeDistribution(reviews);

  if (!data) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '20px' }}>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          No reviews yet — grade distribution will appear once students submit reviews.
        </p>
      </div>
    );
  }

  const avgDifficulty = reviews.reduce((sum, r) => sum + r.difficultyRating, 0) / reviews.length;

  return (
    <div className="panel" style={{ marginTop: '20px' }}>
      <div className="panel-header">
        <span>Grade Distribution</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
          Estimated from {reviews.length} review{reviews.length !== 1 ? 's' : ''} · Avg. Difficulty: {avgDifficulty.toFixed(1)}/5
        </span>
      </div>

      <div style={{ width: '100%', height: 220, marginTop: '10px' }}>
        <ResponsiveContainer>
          <BarChart data={data} barSize={52} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="grade"
              tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 14 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => `${v}%`}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="percent" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 mt-4" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
        {data.map(d => (
          <div key={d.grade} className="flex align-center gap-2" style={{ fontSize: '0.85rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
            <span className="text-muted">Grade {d.grade}:</span>
            <strong style={{ color: d.color }}>{d.percent}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
