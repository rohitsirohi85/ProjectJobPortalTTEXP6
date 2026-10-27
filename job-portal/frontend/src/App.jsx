import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import { Login, Register } from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import PostJob from './pages/PostJob';
import Applicants from './pages/Applicants';
import { Icon, Spinner } from './ui';

function Protected({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="nav">
      <Link to="/" className="brand"><span className="brand-mark"><Icon name="briefcase" size={18} /></span>JobPortal</Link>
      <nav>
        <NavLink to="/" end>Jobs</NavLink>
        {user ? (
          <>
            {user.role === 'employer' && <NavLink to="/post-job">Post a Job</NavLink>}
            <NavLink to="/dashboard">Dashboard</NavLink>
            <button className="link logout" onClick={() => { logout(); nav('/'); }}>
              Logout ({user.name.split(' ')[0]})
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register" className="btn small">Sign up</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/post-job" element={<Protected role="employer"><PostJob /></Protected>} />
          <Route path="/edit-job/:id" element={<Protected role="employer"><PostJob /></Protected>} />
          <Route path="/jobs/:id/applicants" element={<Protected role="employer"><Applicants /></Protected>} />
          <Route path="*" element={<div className="empty"><h3>Page not found</h3><p>The page you are looking for does not exist. <Link to="/">Back to jobs</Link></p></div>} />
        </Routes>
      </main>
      <footer className="footer">© {new Date().getFullYear()} JobPortal · Find work that fits.</footer>
    </>
  );
}
