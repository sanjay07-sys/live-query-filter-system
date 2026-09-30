import express from 'express';
import cors from 'cors';
import catalog from './data/catalog.json' with { type: 'json' };

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Live Query Filter API is running' });
});

app.get('/api/resources', (req, res) => {
  const search = String(req.query.search || '').trim().toLowerCase();
  const category = String(req.query.category || '').trim();
  const level = String(req.query.level || '').trim();
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);

  let results = catalog.filter((item) => {
    const matchesSearch = !search ||
      item.title.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search) ||
      item.level.toLowerCase().includes(search);
    const matchesCategory = !category || item.category === category;
    const matchesLevel = !level || item.level === level;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const total = results.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  results = results.slice(start, start + limit);

  res.json({
    success: true,
    data: results,
    pagination: { page: safePage, limit, total, totalPages }
  });
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
