import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  Star,
  SlidersHorizontal
} from 'lucide-react';
import './styles.css';

const API_URL = 'https://live-query-filter-system-pimy.onrender.com';

const CATEGORIES = [
  'Analytics',
  'Design',
  'Development',
  'Security'
];

const LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced'
];

const LIMIT = 12;

function App() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: LIMIT,
    total: 0,
    totalPages: 1
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /*
   * Debounced search
   * Wait 400ms after the user stops typing
   * before updating the actual search query.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /*
   * Fetch resources from the deployed Express API.
   */
  useEffect(() => {
    const controller = new AbortController();

    async function fetchResources() {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams({
          search,
          page: String(page),
          limit: String(LIMIT)
        });

        if (category) {
          params.set('category', category);
        }

        if (level) {
          params.set('level', level);
        }

        const response = await fetch(
          `${API_URL}/api/resources?${params.toString()}`,
          {
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error('Unable to load resources');
        }

        const result = await response.json();

        setItems(result.data || []);

        setPagination(
          result.pagination || {
            page: 1,
            limit: LIMIT,
            total: 0,
            totalPages: 1
          }
        );
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(
            err.message || 'Something went wrong while loading resources'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchResources();

    return () => controller.abort();
  }, [search, category, level, page]);

  /*
   * Generate visible pagination numbers.
   */
  const pageNumbers = useMemo(() => {
    const total = pagination.totalPages;
    const current = pagination.page;

    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);

    return Array.from(
      { length: end - start + 1 },
      (_, index) => start + index
    );
  }, [pagination]);

  /*
   * Category filter
   */
  const changeCategory = (value) => {
    setCategory(value);
    setPage(1);
  };

  /*
   * Level filter
   */
  const changeLevel = (value) => {
    setLevel(value);
    setPage(1);
  };

  /*
   * Clear all filters and search.
   */
  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setCategory('');
    setLevel('');
    setPage(1);
  };

  return (
    <div className="app">

      {/* HERO / SEARCH SECTION */}
      <header className="hero">
        <div className="hero-inner">

          <div className="eyebrow">
            <BookOpen size={15} />
            LEARNING CATALOG
          </div>

          <h1>Live Query Filter</h1>

          <p>
            Search 250 learning resources instantly with debounced API
            queries, multi-category filters, and pagination.
          </p>

          <div className="search-wrap">
            <Search size={21} />

            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search resources, categories or levels..."
              aria-label="Search learning resources"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="clear"
              >
                Clear
              </button>
            )}
          </div>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="content">

        {/* FILTER SIDEBAR */}
        <aside className="filters">

          <div className="filter-heading">
            <SlidersHorizontal size={18} />
            Filters
          </div>

          {/* CATEGORY */}
          <section>
            <h3>Category</h3>

            <label>
              <input
                type="checkbox"
                checked={!category}
                onChange={() => changeCategory('')}
              />
              All categories
            </label>

            {CATEGORIES.map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={category === item}
                  onChange={() =>
                    changeCategory(category === item ? '' : item)
                  }
                />
                {item}
              </label>
            ))}
          </section>

          {/* LEVEL */}
          <section>
            <h3>Level</h3>

            <label>
              <input
                type="checkbox"
                checked={!level}
                onChange={() => changeLevel('')}
              />
              All levels
            </label>

            {LEVELS.map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={level === item}
                  onChange={() =>
                    changeLevel(level === item ? '' : item)
                  }
                />
                {item}
              </label>
            ))}
          </section>

          {/* CLEAR FILTERS */}
          {(searchInput || category || level) && (
            <button
              type="button"
              className="clear-filters"
              onClick={clearFilters}
            >
              Clear all filters
            </button>
          )}

        </aside>

        {/* RESULTS */}
        <section className="results">

          {/* RESULTS HEADER */}
          <div className="results-top">

            <div>
              <strong>{pagination.total}</strong>{' '}
              {pagination.total === 1 ? 'resource' : 'resources'} found
            </div>

            <div className="status">
              {loading
                ? 'Updating results…'
                : `Page ${pagination.page} of ${pagination.totalPages}`}
            </div>

          </div>

          {/* ERROR */}
          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {/* LOADING */}
          {loading ? (

            <div className="grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  className="skeleton"
                  key={index}
                />
              ))}
            </div>

          ) : items.length ? (

            /* RESOURCE CARDS */
            <div className="grid">

              {items.map((item) => (

                <article
                  className="card"
                  key={item.id}
                >

                  <div className="card-top">

                    <span className="category">
                      {item.category}
                    </span>

                    <span className="level">
                      {item.level}
                    </span>

                  </div>

                  <h2>
                    {item.title}
                  </h2>

                  <div className="meta">

                    <span>
                      <Clock size={15} />
                      {item.durationMinutes} min
                    </span>

                    <span>
                      <Star size={15} />
                      {Number(item.rating).toFixed(1)}
                    </span>

                  </div>

                </article>

              ))}

            </div>

          ) : (

            /* EMPTY STATE */
            <div className="empty">

              <BookOpen size={38} />

              <h2>
                No resources found
              </h2>

              <p>
                Try a different search or remove a filter.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear filters
              </button>

            </div>

          )}

          {/* PAGINATION */}
          {!loading && pagination.total > 0 && (

            <nav
              className="pagination"
              aria-label="Resource pagination"
            >

              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPage(pagination.page - 1)
                }
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <div>

                {pageNumbers.map((number) => (

                  <button
                    type="button"
                    className={
                      number === pagination.page
                        ? 'active'
                        : ''
                    }
                    key={number}
                    onClick={() => setPage(number)}
                  >
                    {number}
                  </button>

                ))}

              </div>

              <button
                type="button"
                disabled={
                  pagination.page >= pagination.totalPages
                }
                onClick={() =>
                  setPage(pagination.page + 1)
                }
              >
                Next
                <ChevronRight size={17} />
              </button>

            </nav>

          )}

        </section>

      </main>

    </div>
  );
}

createRoot(
  document.getElementById('root')
).render(
  <App />
);