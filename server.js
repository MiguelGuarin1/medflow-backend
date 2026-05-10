const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

const SB_URL = process.env.SB_URL;
const SB_KEY = process.env.SB_KEY;

const headers = {
  'apikey':        SB_KEY,
  'Authorization': `Bearer ${SB_KEY}`,
  'Content-Type':  'application/json',
  'Prefer':        'return=representation'
};

// ── GET: leer registros ───────────────────────────────────
app.get('/api/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const params = new URLSearchParams(req.query).toString();
    const url = `${SB_URL}/rest/v1/${encodeURIComponent(table)}${params ? '?'+params : '?select=*'}`;
    const r = await fetch(url, { headers });
    const data = await r.json();
    // Devolver en formato compatible con el HTML actual
    res.json({ records: Array.isArray(data) ? data.map(row => ({ id: row.id, fields: row })) : [] });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST: crear registro ──────────────────────────────────
app.post('/api/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const url = `${SB_URL}/rest/v1/${encodeURIComponent(table)}`;
    const r = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body)
    });
    const data = await r.json();
    res.json({ id: Array.isArray(data) ? data[0]?.id : data?.id, fields: Array.isArray(data) ? data[0] : data });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PATCH: actualizar registro ────────────────────────────
app.patch('/api/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    const url = `${SB_URL}/rest/v1/${encodeURIComponent(table)}?id=eq.${id}`;
    const r = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(req.body)
    });
    const data = await r.json();
    res.json({ id, fields: Array.isArray(data) ? data[0] : data });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── DELETE: eliminar registro ─────────────────────────────
app.delete('/api/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    const url = `${SB_URL}/rest/v1/${encodeURIComponent(table)}?id=eq.${id}`;
    const r = await fetch(url, { method: 'DELETE', headers });
    res.json({ deleted: true, id });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET con filtros: para ordenar y filtrar ───────────────
app.get('/api/:table/filter/:field/:value', async (req, res) => {
  try {
    const { table, field, value } = req.params;
    const url = `${SB_URL}/rest/v1/${encodeURIComponent(table)}?select=*&${field}=eq.${encodeURIComponent(value)}`;
    const r = await fetch(url, { headers });
    const data = await r.json();
    res.json({ records: Array.isArray(data) ? data.map(row => ({ id: row.id, fields: row })) : [] });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MedFlow backend en puerto ${PORT}`));