import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import { Avatar, Icon, Spinner, timeAgo } from '../ui';

export const salary = (j) =>
  j.salary_min || j.salary_max
    ? `₹${(j.salary_min || 0).toLocaleString()} – ₹${(j.salary_max || 0).toLocaleString()}`
    : 'Salary not disclosed';

const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

export default function Jobs() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ search: '', location: '', type: '', category: '' });
  const [data, setData] = useState({ jobs: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [cats, setCats] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (f = filters, p = page) => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries({ ...f, page: p }).filter(([, v]) => v));
    const r = await api.get('/jobs', { params });
    setData(r.data);
    setLoading(false);
  }, [filters, page]);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]);
  useEffect(() => { api.get('/jobs/categories').then((r) => setCats(r.data)); }, []);
  useEffect(() => {
    if (user?.role === 'jobseeker')
      api.get('/saved').then((r) => setSaved(r.data.map((j) => j.id)));
  }, [user]);

  const search = (e) => { e.preventDefault(); setPage(1); load(filters, 1); };
  const pickCategory = (c) => {
    const f = { ...filters, category: filters.category === c ? '' : c };
    setFilters(f); setPage(1); load(f, 1);
  };
  const toggleSave = async (id) => {
    const r = await api.post(`/saved/${id}`);
    setSaved((s) => (r.data.saved ? [...s, id] : s.filter((x) => x !== id)));
  };

  return (
    <>
      <section className="hero">
        <span className="open-count"><i />{data.total} open role{data.total !== 1 && 's'} right now</span>
        <h1>Find work that fits your life.</h1>
        <p className="lead">Search jobs by title, company or city, and apply in a couple of minutes.</p>
        <form className="searchbar" onSubmit={search}>
          <div className="field-icon">
            <Icon name="search" stroke />
            <input aria-label="Search jobs" placeholder="Job title, company or keyword" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          </div>
          <div className="field-icon">
            <Icon name="pin" />
            <input aria-label="Location" placeholder="Location" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
          </div>
          <select aria-label="Job type" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All types</option>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select aria-label="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All categories</option>
            {cats.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button className="btn">Search</button>
        </form>
        {cats.length > 0 && (
          <div className="chips">
            {cats.slice(0, 8).map((c) => (
              <button type="button" key={c} className={`chip ${filters.category === c ? 'on' : ''}`} onClick={() => pickCategory(c)}>{c}</button>
            ))}
          </div>
        )}
      </section>

      <div className="results-head">
        <h2>Latest jobs</h2>
        <span className="muted">{data.total} job{data.total !== 1 && 's'} found</span>
      </div>

      {loading ? <Spinner label="Finding jobs" /> : data.jobs.length === 0 ? (
        <div className="empty"><h3>No jobs match your search</h3><p>Try a different keyword or clear a filter.</p></div>
      ) : data.jobs.map((j) => (
        <div className="card job" key={j.id}>
          <Avatar name={j.company} size={54} />
          <div className="job-body">
            <div className="job-top">
              <div>
                <Link to={`/jobs/${j.id}`}><h3>{j.title}</h3></Link>
                <div className="meta">
                  <span>{j.company}</span>
                  <span><Icon name="pin" size={14} />{j.location}</span>
                  {j.created_at && <span>{timeAgo(j.created_at)}</span>}
                </div>
              </div>
              {user?.role === 'jobseeker' && (
                <button className={`save ${saved.includes(j.id) ? 'on' : ''}`} onClick={() => toggleSave(j.id)} aria-label={saved.includes(j.id) ? 'Remove from saved' : 'Save job'} title={saved.includes(j.id) ? 'Saved' : 'Save'}>
                  <Icon name="bookmark" />
                </button>
              )}
            </div>
            <div>
              <span className="tag">{j.job_type}</span>{j.category && <span className="tag neutral">{j.category}</span>}
              <span className="salary">{salary(j)}</span>
            </div>
            <p className="snippet">{j.snippet}…</p>
          </div>
        </div>
      ))}

      {data.pages > 1 && (
        <div className="pager">
          <button className="btn small ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {data.pages}</span>
          <button className="btn small" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}
