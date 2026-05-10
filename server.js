const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const SB_URL = process.env.SB_URL;
const SB_KEY = process.env.SB_KEY;

const sbHeaders = {
  'apikey': SB_KEY,
  'Authorization': `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// GET
app.get('/api/:table', async (req, res) => {
  try {
    const url = `${SB_URL}/rest/v1/${req.params.table}?select=*`;
    console.log('GET', url);
    const r = await fetch(url, { headers: sbHeaders });
    const data = await r.json();
    console.log('Response status:', r.status, '| Records:', Array.isArray(data) ? data.length : 'error');
    if (!Array.isArray(data)) return res.status(500).json({ error: data });
    res.json({ records: data.map(row => ({ id: row.id, fields: row })) });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// POST
app.post('/api/:table', async (req, res) => {
  try {
    const url = `${SB_URL}/rest/v1/${req.params.table}`;
    console.log('POST', url, req.body);
    const r = await fetch(url, {
      method: 'POST',
      headers: sbHeaders,
      body: JSON.stringify(req.body)
    });
    const data = await r.json();
    console.log('POST response:', r.status, JSON.stringify(data).substring(0,200));
    res.json({ id: Array.isArray(data) ? data[0]?.id : data?.id, fields: Array.isArray(data) ? data[0] : data });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH
app.patch('/api/:table/:id', async (req, res) => {
  try {
    const url = `${SB_URL}/rest/v1/${req.params.table}?id=eq.${req.params.id}`;
    console.log('PATCH', url, req.body);
    const r = await fetch(url, {
      method: 'PATCH',
      headers: sbHeaders,
      body: JSON.stringify(req.body)
    });
    const data = await r.json();
    res.json({ id: req.params.id, fields: Array.isArray(data) ? data[0] : data });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE
app.delete('/api/:table/:id', async (req, res) => {
  try {
    const url = `${SB_URL}/rest/v1/${req.params.table}?id=eq.${req.params.id}`;
    const r = await fetch(url, { method: 'DELETE', headers: sbHeaders });
    res.json({ deleted: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MedFlow backend activo en puerto ${PORT}`));