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
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseDetail from './pages/CourseDetail';
import FacultyProfile from './pages/FacultyProfile';
import FacultyList from './pages/FacultyList';
import ForumList from './pages/ForumList';
import ForumDetail from './pages/ForumDetail';
import DepartmentFilterPage from './pages/DepartmentFilterPage';
import CourseDetailByCode from './pages/CourseDetailByCode';
import Planner from './pages/Planner';
import AdminDashboard from './pages/AdminDashboard';
import { LogOut, BookOpen, Search, Filter, BookMarked, Shield } from 'lucide-react';

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
      <div className="app-container">
        {/* Topbar */}
        <header className="topbar">
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen color="var(--primary)" size={24} />
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>CourseCritic</h2>
          </Link>
          <div className="flex align-center gap-4">
            {user ? (
              <div className="flex align-center gap-3">
                <span className="text-muted" style={{ fontSize: '0.9rem' }}>{user.username}</span>
                <button onClick={handleLogout} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '4px 12px', fontSize: '0.8rem' }}>Login</Link>
                <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '4px 12px', fontSize: '0.8rem' }}>Sign Up</Link>
              </div>
            )}
          </div>
        </header>

        <div className="main-layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <Link to="/" className="sidebar-link">
              <BookOpen size={18} /> Courses
            </Link>
            <Link to="/departments" className="sidebar-link">
              <Filter size={18} /> Departments
            </Link>
            <Link to="/faculty" className="sidebar-link">
              <Search size={18} /> Faculty
            </Link>
            <Link to="/forum" className="sidebar-link">
              <LogOut style={{ transform: 'rotate(180deg)' }} size={18} /> Forum
            </Link>
            <Link to="/planner" className="sidebar-link">
              <BookMarked size={18} /> My Planner
            </Link>
            {user && user.role === 'Admin' && (
              <Link to="/admin" className="sidebar-link" style={{ color: 'var(--primary)' }}>
                <Shield size={18} /> Admin Dashboard
              </Link>
            )}
          </aside>

          {/* Main Content Area */}
          <main className="content-area">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/register" element={<Register setUser={setUser} />} />
              <Route path="/course/:id" element={<CourseDetail user={user} />} />
              <Route path="/course/code/:code" element={<CourseDetailByCode />} />
              <Route path="/departments" element={<DepartmentFilterPage />} />
              <Route path="/faculty/:id" element={<FacultyProfile />} />
              <Route path="/faculty" element={<FacultyList />} />
              <Route path="/forum" element={<ForumList user={user} />} />
              <Route path="/forum/:id" element={<ForumDetail user={user} />} />
              <Route path="/planner" element={<Planner user={user} />} />
              <Route path="/admin" element={<AdminDashboard user={user} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
