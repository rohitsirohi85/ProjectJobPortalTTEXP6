import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';

const empty = {
  title: '', company: '', location: '', job_type: 'Full-time', category: '',
  salary_min: '', salary_max: '', description: '', requirements: '', is_active: true,
};

export default function PostJob() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ ...empty, company: user?.company_name || '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    if (id) api.get(`/jobs/${id}`).then((r) => setF({ ...empty, ...r.data, is_active: !!r.data.is_active }));
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (id) await api.put(`/jobs/${id}`, f); else await api.post('/jobs', f);
      nav('/dashboard');
    } catch (x) { setErr(errMsg(x)); }
  };

  return (
    <form className="card form" style={{ maxWidth: 760, margin: '0 auto' }} onSubmit={submit}>
      <div>
        <h2 className="page-title">{id ? 'Edit job' : 'Post a new job'}</h2>
        <p className="page-sub" style={{ marginBottom: 0 }}>Clear details get you better applicants.</p>
      </div>
      {err && <p className="error">{err}</p>}
      <label className="field">Job title<input placeholder="Job title" required value={f.title} onChange={set('title')} /></label>
      <div className="row">
        <label className="field">Company<input placeholder="Company" required value={f.company} onChange={set('company')} /></label>
        <label className="field">Location<input placeholder="Location" required value={f.location} onChange={set('location')} /></label>
      </div>
      <div className="row">
        <label className="field">Job type
          <select value={f.job_type} onChange={set('job_type')}>
            {['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="field">Category<input placeholder="Category (e.g. IT, Marketing)" value={f.category || ''} onChange={set('category')} /></label>
      </div>
      <div className="row">
        <label className="field">Min salary (₹)<input type="number" placeholder="Min salary" value={f.salary_min || ''} onChange={set('salary_min')} /></label>
        <label className="field">Max salary (₹)<input type="number" placeholder="Max salary" value={f.salary_max || ''} onChange={set('salary_max')} /></label>
      </div>
      <label className="field">Job description<textarea rows={6} placeholder="Job description" required value={f.description} onChange={set('description')} /></label>
      <label className="field">Requirements<textarea rows={4} placeholder="Requirements" value={f.requirements || ''} onChange={set('requirements')} /></label>
      <label className="check"><input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} /> Accepting applications</label>
      <div><button className="btn">{id ? 'Save changes' : 'Publish job'}</button></div>
    </form>
  );
}
