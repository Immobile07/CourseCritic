import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseDetail from './pages/CourseDetail';
import ProfessorProfile from './pages/ProfessorProfile';
import Professors from './pages/Professors';
import GPASimulator from './pages/GPASimulator';
import { LogOut, BookOpen, Search, Users, Calculator } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <Router>
      <nav className="glass-nav flex justify-between align-center">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="flex align-center gap-2">
            <BookOpen color="var(--primary)" size={32} />
            <h2 className="text-gradient" style={{ margin: 0 }}>CourseCritic</h2>
          </div>
        </Link>
        <div className="flex align-center gap-4">
          <Link to="/" className="btn-secondary flex align-center gap-2" style={{ textDecoration: 'none' }}>
            <Search size={18} /> Courses
          </Link>
          <Link to="/professors" className="btn-secondary flex align-center gap-2" style={{ textDecoration: 'none' }}>
            <Users size={18} /> Professors
          </Link>
          {user && (
            <Link to="/simulator" className="btn-secondary flex align-center gap-2" style={{ textDecoration: 'none' }}>
              <Calculator size={18} /> Simulator
            </Link>
          )}
          {user ? (
            <div className="flex align-center gap-4">
              <span className="text-muted">Hello, {user.username}</span>
              <button onClick={handleLogout} className="btn-secondary flex align-center gap-2">
                <LogOut size={18} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none' }}>Login</Link>
              <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>Sign Up</Link>
            </div>
          )}
        </div>
      </nav>

      <main className="container animate-fade-in" style={{ padding: '40px 20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/professors" element={<Professors />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/course/:id" element={<CourseDetail user={user} />} />
          <Route path="/professor/:id" element={<ProfessorProfile />} />
          <Route path="/simulator" element={<GPASimulator user={user} />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
