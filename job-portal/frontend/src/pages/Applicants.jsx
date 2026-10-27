import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import api, { FILE_URL } from '../api';
import { Avatar, Icon, Spinner } from '../ui';

const STATUSES = ['Applied', 'Reviewing', 'Shortlisted', 'Rejected', 'Hired'];

export default function Applicants() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  const load = () => api.get(`/applications/job/${id}`).then((r) => setData(r.data));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const setStatus = async (appId, status) => {
    await api.patch(`/applications/${appId}/status`, { status });
    load();
  };

  if (!data) return <Spinner />;
  return (
    <>
      <Link to="/dashboard" className="back"><Icon name="arrow" size={16} stroke /> Back to dashboard</Link>
      <h2 className="page-title">Applicants for “{data.job.title}”</h2>
      <p className="page-sub">{data.applicants.length} applicant{data.applicants.length !== 1 && 's'}</p>
      {data.applicants.length === 0 && <div className="empty"><h3>No applications yet</h3><p>Applicants will appear here as soon as someone applies.</p></div>}
      {data.applicants.map((a) => (
        <div className="card applicant" key={a.id}>
          <div className="between">
            <div className="who">
              <Avatar name={a.name} size={56} round />
              <div>
                <h3>{a.name}</h3>
                <p className="muted">{a.headline || '—'} · {a.location || 'Location n/a'}</p>
                <div className="contact">
                  <span><Icon name="mail" size={15} /> {a.email}</span>
                  {a.phone && <span><Icon name="phone" size={15} /> {a.phone}</span>}
                </div>
              </div>
            </div>
            <select aria-label="Application status" value={a.status} onChange={(e) => setStatus(a.id, e.target.value)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          {a.cover_letter && <p className="pre letter">{a.cover_letter}</p>}
          {a.resume_path && <a href={FILE_URL + a.resume_path} target="_blank" rel="noreferrer"><Icon name="file" size={16} /> View resume</a>}
        </div>
      ))}
    </>
  );
}
