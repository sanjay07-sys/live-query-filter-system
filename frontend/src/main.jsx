import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, ChevronLeft, ChevronRight, BookOpen, Clock, Star, SlidersHorizontal } from 'lucide-react';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const CATEGORIES = ['Analytics', 'Design', 'Development', 'Security'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LIMIT = 12;

function App() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: LIMIT, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchResources() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ search, page: String(page), limit: String(LIMIT) });
        if (category) params.set('category', category);
        if (level) params.set('level', level);
        const response = await fetch(`${API_URL}/resources?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Unable to load resources');
        const result = await response.json();
        setItems(result.data);
        setPagination(result.pagination);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Something went wrong');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    fetchResources();
    return () => controller.abort();
  }, [search, category, level, page]);

  const pageNumbers = useMemo(() => {
    const total = pagination.totalPages;
    const current = pagination.page;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [pagination]);

  const changeCategory = (value) => { setCategory(value); setPage(1); };
  const changeLevel = (value) => { setLevel(value); setPage(1); };

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <div className="eyebrow"><BookOpen size={15}/> LEARNING CATALOG</div>
          <h1>Live Query Filter</h1>
          <p>Search 250 learning resources instantly with debounced API queries, multi-category filters, and pagination.</p>
          <div className="search-wrap">
            <Search size={21}/>
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search resources, categories or levels..." />
            {searchInput && <button onClick={() => setSearchInput('')} className="clear">Clear</button>}
          </div>
        </div>
      </header>

      <main className="content">
        <aside className="filters">
          <div className="filter-heading"><SlidersHorizontal size={18}/> Filters</div>
          <section>
            <h3>Category</h3>
            <label><input type="checkbox" checked={!category} onChange={() => changeCategory('')}/> All categories</label>
            {CATEGORIES.map(c => <label key={c}><input type="checkbox" checked={category === c} onChange={() => changeCategory(category === c ? '' : c)}/>{c}</label>)}
          </section>
          <section>
            <h3>Level</h3>
            <label><input type="checkbox" checked={!level} onChange={() => changeLevel('')}/> All levels</label>
            {LEVELS.map(l => <label key={l}><input type="checkbox" checked={level === l} onChange={() => changeLevel(level === l ? '' : l)}/>{l}</label>)}
          </section>
        </aside>

        <section className="results">
          <div className="results-top">
            <div><strong>{pagination.total}</strong> resources found</div>
            <div className="status">{loading ? 'Updating results…' : `Page ${pagination.page} of ${pagination.totalPages}`}</div>
          </div>

          {error && <div className="error">{error}. Make sure the backend API is running.</div>}
          {loading ? <div className="grid">{Array.from({length: 6}).map((_, i) => <div className="skeleton" key={i}></div>)}</div> :
            items.length ? <div className="grid">{items.map(item => (
              <article className="card" key={item.id}>
                <div className="card-top"><span className="category">{item.category}</span><span className="level">{item.level}</span></div>
                <h2>{item.title}</h2>
                <div className="meta"><span><Clock size={15}/>{item.durationMinutes} min</span><span><Star size={15}/>{item.rating.toFixed(1)}</span></div>
              </article>
            ))}</div> : <div className="empty"><BookOpen size={38}/><h2>No resources found</h2><p>Try a different search or remove a filter.</p></div>}

          {!loading && pagination.total > 0 && <nav className="pagination">
            <button disabled={pagination.page <= 1} onClick={() => setPage(pagination.page - 1)}><ChevronLeft size={17}/> Previous</button>
            <div>{pageNumbers.map(n => <button className={n === pagination.page ? 'active' : ''} key={n} onClick={() => setPage(n)}>{n}</button>)}</div>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPage(pagination.page + 1)}>Next <ChevronRight size={17}/></button>
          </nav>}
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
