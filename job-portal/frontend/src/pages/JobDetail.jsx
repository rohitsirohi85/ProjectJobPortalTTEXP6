import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { salary } from './Jobs';
import { Avatar, Icon, Spinner, timeAgo } from '../ui';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [applied, setApplied] = useState(false);
  const [cover, setCover] = useState('');
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get(`/jobs/${id}`).then((r) => setJob(r.data)).catch(() => setJob(false));
  }, [id]);
  useEffect(() => {
    if (user?.role === 'jobseeker')
      api.get('/applications/mine').then((r) => setApplied(r.data.some((a) => a.job_id === Number(id))));
  }, [user, id]);

  const apply = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('cover_letter', cover);
    if (file) fd.append('resume', file);
    try {
      await api.post(`/applications/${id}`, fd);
      setApplied(true);
      setMsg({ type: 'ok', text: 'Application submitted!' });
    } catch (x) { setMsg({ type: 'error', text: errMsg(x) }); }
  };

  if (job === null) return <Spinner />;
  if (job === false) return <div className="empty"><h3>Job not found</h3><p><Link to="/">Back to all jobs</Link></p></div>;

  return (
    <>
      <Link to="/" className="back"><Icon name="arrow" size={16} stroke /> Back to jobs</Link>
      <div className="detail">
        <div className="card">
          <div className="detail-head">
            <Avatar name={job.company} size={68} />
            <div>
              <h2>{job.title}</h2>
              <p className="muted">{job.company} · {job.location}</p>
            </div>
          </div>
          <span className="tag">{job.job_type}</span>{job.category && <span className="tag neutral">{job.category}</span>}
          <h4>Description</h4><p className="pre">{job.description}</p>
          {job.requirements && (<><h4>Requirements</h4><p className="pre">{job.requirements}</p></>)}
        </div>

        <aside className="card side">
          <div className="salary-big">{salary(job)}</div>
          <ul className="facts">
            <li><span>Job type</span><b>{job.job_type}</b></li>
            <li><span>Location</span><b>{job.location}</b></li>
            {job.category && <li><span>Category</span><b>{job.category}</b></li>}
            {job.created_at && <li><span>Posted</span><b>{timeAgo(job.created_at)}</b></li>}
          </ul>
          <hr />
          {!user ? (
            <p className="muted"><Link to="/login">Login</Link> or <Link to="/register">sign up</Link> to apply.</p>
          ) : user.role === 'employer' ? (
            <p className="muted">Employers can't apply to jobs.</p>
          ) : !job.is_active ? (
            <p className="error">This job is no longer accepting applications.</p>
          ) : applied ? (
            <p className="ok" style={{ margin: 0 }}><Icon name="check" stroke /> You have applied to this job.</p>
          ) : (
            <form className="form" onSubmit={apply}>
              <h4 style={{ fontSize: '1.15rem' }}>Apply now</h4>
              {msg.text && <p className={msg.type}>{msg.text}</p>}
              <textarea rows={5} placeholder="Cover letter (optional)" value={cover} onChange={(e) => setCover(e.target.value)} />
              <label className="field">Resume
                <span className="hint">PDF/DOC/DOCX, max 5MB</span>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} />
              </label>
              <button className="btn block">Submit application</button>
            </form>
          )}
        </aside>
      </div>
    </>
  );
}
