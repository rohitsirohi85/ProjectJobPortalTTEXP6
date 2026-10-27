import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { Avatar, Icon } from '../ui';

function Profile() {
  const { user, setUser } = useAuth();
  const [f, setF] = useState({ name: user.name, phone: user.phone || '', location: user.location || '', headline: user.headline || '', bio: user.bio || '', company_name: user.company_name || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try { setUser((await api.put('/auth/me', f)).data); setMsg('Profile saved'); }
    catch (x) { setMsg(errMsg(x)); }
  };
  const changePw = async (e) => {
    e.preventDefault();
    try { await api.put('/auth/password', pw); setMsg('Password updated'); setPw({ currentPassword: '', newPassword: '' }); }
    catch (x) { setMsg(errMsg(x)); }
  };

  return (
    <>
      {msg && <p className="ok">{msg}</p>}
      <form className="card form" onSubmit={save}>
        <h3>Profile</h3>
        <div className="row">
          <label className="field">Name<input placeholder="Name" value={f.name} onChange={set('name')} /></label>
          <label className="field">Phone<input placeholder="Phone" value={f.phone} onChange={set('phone')} /></label>
        </div>
        <div className="row">
          <label className="field">Location<input placeholder="Location" value={f.location} onChange={set('location')} /></label>
          {user.role === 'employer'
            ? <label className="field">Company name<input placeholder="Company name" value={f.company_name} onChange={set('company_name')} /></label>
            : <label className="field">Headline<input placeholder="Headline (e.g. React Developer)" value={f.headline} onChange={set('headline')} /></label>}
        </div>
        <label className="field">About you<textarea rows={3} placeholder="About you" value={f.bio} onChange={set('bio')} /></label>
        <div><button className="btn">Save profile</button></div>
      </form>
      <form className="card form" onSubmit={changePw}>
        <h3>Change password</h3>
        <div className="row">
          <label className="field">Current password<input type="password" placeholder="Current password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></label>
          <label className="field">New password<input type="password" placeholder="New password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></label>
        </div>
        <div><button className="btn">Update password</button></div>
      </form>
    </>
  );
}

function SeekerView() {
  const [apps, setApps] = useState([]);
  const [saved, setSaved] = useState([]);
  useEffect(() => {
    api.get('/applications/mine').then((r) => setApps(r.data));
    api.get('/saved').then((r) => setSaved(r.data));
  }, []);
  const unsave = async (id) => { await api.post(`/saved/${id}`); setSaved(saved.filter((j) => j.id !== id)); };

  const progressed = apps.filter((a) => ['Shortlisted', 'Hired'].includes(a.status)).length;
  return (
    <>
      <div className="stats">
        <div className="stat"><b>{apps.length}</b><span>Applications</span></div>
        <div className="stat"><b>{progressed}</b><span>Shortlisted or hired</span></div>
        <div className="stat"><b>{saved.length}</b><span>Saved jobs</span></div>
      </div>
      <h3 className="section-title">My applications ({apps.length})</h3>
      {apps.length === 0 && <div className="empty"><h3>No applications yet</h3><p>Find a role you like and apply. <Link to="/">Browse jobs</Link></p></div>}
      {apps.map((a) => (
        <div className="card list-item" key={a.id}>
          <div className="lead-info">
            <Avatar name={a.company} size={46} />
            <div>
              <Link to={`/jobs/${a.job_id}`}><b>{a.title}</b></Link>
              <p className="muted">{a.company} · {a.location} · Applied {new Date(a.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <span className={`status ${a.status}`}>{a.status}</span>
        </div>
      ))}
      <h3 className="section-title">Saved jobs ({saved.length})</h3>
      {saved.length === 0 && <p className="muted">Jobs you save will show up here.</p>}
      {saved.map((j) => (
        <div className="card list-item" key={j.id}>
          <div className="lead-info">
            <Avatar name={j.company} size={46} />
            <div><Link to={`/jobs/${j.id}`}><b>{j.title}</b></Link><p className="muted">{j.company} · {j.location}</p></div>
          </div>
          <button className="link danger" onClick={() => unsave(j.id)}>Remove</button>
        </div>
      ))}
    </>
  );
}

function EmployerView() {
  const [jobs, setJobs] = useState([]);
  const load = () => api.get('/jobs/employer/mine').then((r) => setJobs(r.data));
  useEffect(() => { load(); }, []);
  const del = async (id) => {
    if (confirm('Delete this job and all its applications?')) { await api.delete(`/jobs/${id}`); load(); }
  };

  const totalApplicants = jobs.reduce((n, j) => n + Number(j.applicants || 0), 0);
  return (
    <>
      <div className="stats">
        <div className="stat"><b>{jobs.length}</b><span>Job posts</span></div>
        <div className="stat"><b>{jobs.filter((j) => j.is_active).length}</b><span>Accepting applications</span></div>
        <div className="stat"><b>{totalApplicants}</b><span>Total applicants</span></div>
      </div>
      <div className="between section-title"><h3>My job posts ({jobs.length})</h3><Link className="btn small" to="/post-job"><Icon name="plus" size={16} stroke /> Post job</Link></div>
      {jobs.length === 0 && <div className="empty"><h3>No jobs posted yet</h3><p>Post your first job to start receiving applications.</p></div>}
      {jobs.map((j) => (
        <div className="card list-item" key={j.id}>
          <div className="lead-info">
            <Avatar name={j.company || 'J'} size={46} />
            <div>
              <Link to={`/jobs/${j.id}`}><b>{j.title}</b></Link> {!j.is_active && <span className="tag neutral">Closed</span>}
              <p className="muted">{j.location} · {j.applicants} applicant{j.applicants !== 1 && 's'}</p>
            </div>
          </div>
          <div className="actions">
            <Link to={`/jobs/${j.id}/applicants`}>Applicants</Link>
            <Link to={`/edit-job/${j.id}`}>Edit</Link>
            <button className="link danger" onClick={() => del(j.id)}>Delete</button>
          </div>
        </div>
      ))}
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('main');
  return (
    <>
      <div className="welcome">
        <Avatar name={user.name} size={60} round />
        <div>
          <h2 className="page-title">Hello, {user.name}</h2>
          <p className="page-sub" style={{ margin: 0 }}>{user.role === 'employer' ? 'Manage your jobs and applicants.' : 'Track your applications and saved jobs.'}</p>
        </div>
      </div>
      <div className="tabs">
        <button className={tab === 'main' ? 'active' : ''} onClick={() => setTab('main')}>{user.role === 'employer' ? 'My jobs' : 'Applications'}</button>
        <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>Profile & settings</button>
      </div>
      {tab === 'profile' ? <Profile /> : user.role === 'employer' ? <EmployerView /> : <SeekerView />}
    </>
  );
}
