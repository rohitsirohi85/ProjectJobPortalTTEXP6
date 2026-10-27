import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try { await login(f.email, f.password); nav('/dashboard'); }
    catch (x) { setErr(errMsg(x)); }
  };

  return (
    <div className="auth">
      <div className="auth-side">
        <h2>Your next role is one login away.</h2>
        <p>Track applications, save jobs and manage your hiring in one place.</p>
      </div>
      <form className="auth-form" onSubmit={submit}>
        <h2>Welcome back</h2>
        <p className="muted">Log in to continue.</p>
        {err && <p className="error">{err}</p>}
        <label className="field">Email
          <input type="email" placeholder="you@example.com" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </label>
        <label className="field">Password
          <input type="password" placeholder="Your password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        </label>
        <button className="btn block">Login</button>
        <p className="muted">No account? <Link to="/register">Sign up</Link></p>
      </form>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'jobseeker', company_name: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try { await register(f); nav('/dashboard'); }
    catch (x) { setErr(errMsg(x)); }
  };

  return (
    <div className="auth">
      <div className="auth-side">
        <h2>{f.role === 'employer' ? 'Hire people who fit.' : 'Find work that fits.'}</h2>
        <p>{f.role === 'employer' ? 'Post a job, review applicants and update their status in one dashboard.' : 'Create a profile once, then apply to jobs with a cover letter and resume.'}</p>
      </div>
      <form className="auth-form" onSubmit={submit}>
        <h2>Create your account</h2>
        {err && <p className="error">{err}</p>}
        <div className="seg">
          <button type="button" className={f.role === 'jobseeker' ? 'active' : ''} onClick={() => setF({ ...f, role: 'jobseeker' })}>I'm looking for a job</button>
          <button type="button" className={f.role === 'employer' ? 'active' : ''} onClick={() => setF({ ...f, role: 'employer' })}>I'm hiring</button>
        </div>
        <label className="field">Full name
          <input placeholder="Full name" required value={f.name} onChange={set('name')} />
        </label>
        {f.role === 'employer' && (
          <label className="field">Company name
            <input placeholder="Company name" value={f.company_name} onChange={set('company_name')} />
          </label>
        )}
        <label className="field">Email
          <input type="email" placeholder="you@example.com" required value={f.email} onChange={set('email')} />
        </label>
        <label className="field">Password
          <input type="password" placeholder="Min 6 characters" required minLength={6} value={f.password} onChange={set('password')} />
        </label>
        <button className="btn block">Sign up</button>
        <p className="muted">Already registered? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
