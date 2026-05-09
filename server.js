const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const AT_KEY = process.env.AT_KEY;
const AT_BASE = process.env.AT_BASE || 'apppraLNTnzqeES6E';

if (!AT_KEY) {
  console.error('Falta AT_KEY');
  process.exit(1);
}

app.get('/api/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const query = new URLSearchParams(req.query).toString();

    const url = `https://api.airtable.com/v0/${AT_BASE}/${encodeURIComponent(table)}${query ? '?' + query : ''}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AT_KEY}`
      }
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
});