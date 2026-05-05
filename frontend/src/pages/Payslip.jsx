import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Receipt, CreditCard, Clock, ChevronDown, ChevronUp, Calculator } from 'lucide-react';

const API = 'http://localhost:5000/api';
const GRADE_OPTIONS = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];
const SCHOLARSHIP_TABLE = [
  { range: '3.70 – 3.84', pct: '10%' }, { range: '3.85 – 3.89', pct: '25%' }, { range: '3.90 – 3.94', pct: '50%' },
  { range: '3.95 – 3.99', pct: '75%' }, { range: '4.00', pct: '100%' },
];

function fmt(n) { return Number(n).toLocaleString('en-BD') + ' ৳'; }

// --- ScholarshipBadge Component ---
const SCHOLARSHIP_TIERS = [
  { min: 4.00, max: 4.00, label: '100%', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  { min: 3.95, max: 3.99, label: '75%', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  { min: 3.90, max: 3.94, label: '50%', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  { min: 3.85, max: 3.89, label: '25%', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { min: 3.70, max: 3.84, label: '10%', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
];

function ScholarshipBadge({ cgpa }) {
  const tier = SCHOLARSHIP_TIERS.find(t => cgpa >= t.min && cgpa <= t.max);
  if (!tier) return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>No Scholarship</span>;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: tier.bg, border: `1px solid ${tier.color}`, borderRadius: '20px', padding: '4px 16px', fontSize: '0.85rem', color: tier.color, fontWeight: 700, boxShadow: `0 0 10px ${tier.bg}` }}>🎓 {tier.label} Scholarship</span>;
}

export default function Payslip({ user }) {
  const [planner, setPlanner] = useState([]);
  const [grades, setGrades] = useState({});
  const [semester, setSemester] = useState('Summer 2025');
  const [preview, setPreview] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [expandedSlip, setExpandedSlip] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (user) {
      axios.get(`${API}/users/planner`, { headers }).then(res => setPlanner(res.data)).catch(console.error).finally(() => setLoading(false));
      fetchHistory();
    } else { setLoading(false); }
  }, [user]);

  const fetchHistory = () => axios.get(`${API}/features/payslip/my`, { headers }).then(res => setHistory(res.data)).catch(console.error);

  const getFilledGrades = () => Object.fromEntries(Object.entries(grades).filter(([, v]) => v));

  const handlePreview = async () => {
    const filledGrades = getFilledGrades();
    if (!Object.keys(filledGrades).length) return setError('Please assign at least one grade.');
    setError(''); setPreviewLoading(true);
    try {
      const res = await axios.post(`${API}/features/payslip/preview`, { semester, grades: filledGrades }, { headers });
      setPreview(res.data);
    } catch (e) { setError(e.response?.data?.error || 'Failed to calculate fees'); }
    finally { setPreviewLoading(false); }
  };

  const handlePay = async () => {
    setError(''); setPayLoading(true);
    try {
      const res = await axios.post(`${API}/features/payslip/create-session`, { semester, grades: getFilledGrades() }, { headers });
      window.location.href = res.data.url;
    } catch (e) { setError(e.response?.data?.error || 'Payment initiation failed'); setPayLoading(false); }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') { fetchHistory(); window.history.replaceState({}, '', '/payslip'); }
  }, []);

  if (!user) return <div style={{ textAlign: 'center', padding: '60px 20px' }}><h2>Payslip</h2><p>Please <Link to="/login" style={{ color: 'var(--primary)' }}>log in</Link>.</p></div>;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="text-gradient"><Receipt size={36} /> Payslip & Fee Calculator</h1>
      </div>

      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <button onClick={() => setShowTable(!showTable)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, width: '100%' }}>
          🎓 Scholarship Tiers {showTable ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {showTable && (
          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead><tr><th>CGPA Range</th><th>Scholarship</th><th>Applied To</th></tr></thead>
              <tbody>{SCHOLARSHIP_TABLE.map(r => <tr key={r.range}><td>{r.range}</td><td style={{ color: '#10b981', fontWeight: 700 }}>{r.pct}</td><td>Tuition fee only</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <div className="glass-panel">
            <h2>Step 1: Enter Grades</h2>
            <div style={{ marginBottom: '16px' }}>
              <label>Semester</label>
              <input className="input-glass" value={semester} onChange={e => setSemester(e.target.value)} />
            </div>
            {loading ? <p>Loading...</p> : (
              <>
                {planner.length === 0 && <p>No courses. Add via <Link to="/simulator">GPA Simulator</Link>.</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {planner.map(c => (
                    <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.15)', padding: '10px 12px', borderRadius: '8px' }}>
                      <div><div>{c.courseCode}</div><div style={{ fontSize: '0.75rem' }}>{c.creditHours} cr</div></div>
                      <select className="input-glass" style={{ width: '90px', color: 'black' }} value={grades[c._id] || ''} onChange={e => setGrades({ ...grades, [c._id]: e.target.value })}>
                        <option value="" disabled style={{ color: 'black' }}>Grade</option>
                        {GRADE_OPTIONS.map(g => <option key={g} value={g} style={{ color: 'black' }}>{g}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                {error && <div style={{ color: '#ef4444', marginTop: '12px' }}>{error}</div>}
                <button onClick={handlePreview} disabled={previewLoading} className="btn-primary" style={{ width: '100%', marginTop: '20px' }}><Calculator size={18} /> Calculate Fees</button>
              </>
            )}
          </div>
        </div>

        <div>
          {preview ? (
            <div className="glass-panel animate-fade-in" style={{ borderColor: 'var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div><h2>Fee Breakdown</h2><p>{preview.semester}</p></div>
                <ScholarshipBadge cgpa={preview.cgpa} />
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                <div className="text-gradient" style={{ fontSize: '3rem', fontWeight: 800 }}>{preview.cgpa}</div>
                <div>Based on {preview.totalCredits} credits</div>
              </div>
              {[
                { label: 'Tuition Fee', value: fmt(preview.tuitionFee) },
                { label: 'Semester Fee', value: fmt(preview.semesterFee) },
                { label: 'Gross Total', value: fmt(preview.grossTotal), bold: true },
                { label: `Scholarship (${preview.scholarshipPercentage}%)`, value: `− ${fmt(preview.scholarshipDeduction)}`, color: '#10b981' }
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: row.bold ? 700 : 400 }}>{row.label}</div>
                  <div style={{ fontWeight: row.bold ? 700 : 600, color: row.color || 'var(--text-main)' }}>{row.value}</div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontSize: '1.1rem', fontWeight: 800 }}>
                <div>Net Payable</div><div style={{ color: '#6366f1' }}>{fmt(preview.netPayable)}</div>
              </div>
              <button onClick={handlePay} disabled={payLoading} className="btn-primary" style={{ width: '100%', marginTop: '20px' }}><CreditCard size={20} /> Pay via Stripe</button>
            </div>
          ) : (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <Receipt size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
              <p>Enter grades on the left to see your breakdown.</p>
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="glass-panel" style={{ marginTop: '32px' }}>
          <h2><Clock size={22} /> Payment History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.map(slip => (
              <div key={slip._id} style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div onClick={() => setExpandedSlip(expandedSlip === slip._id ? null : slip._id)} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div><div style={{ fontWeight: 700 }}>{slip.semester}</div><div style={{ fontSize: '0.8rem' }}>{new Date(slip.createdAt).toLocaleDateString()}</div></div>
                    <ScholarshipBadge cgpa={slip.cgpa} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{fmt(slip.netPayable)}</div>
                    <span style={{ color: slip.paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }}>{slip.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}</span>
                  </div>
                </div>
                {expandedSlip === slip._id && (
                  <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                    <p>CGPA: {slip.cgpa} | Credits: {slip.totalCreditHours} | Scholarship: -{slip.scholarshipPercentage}%</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
