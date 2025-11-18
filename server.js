const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const qs = require('querystring');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Environment variables (set these in Render or your host)
// EXOTEL_SID, EXOTEL_TOKEN, EXO_VIRTUAL, ASTRO_NUMBER, BACKEND_URL
const EXOTEL_SID = process.env.EXOTEL_SID;
const EXOTEL_TOKEN = process.env.EXOTEL_TOKEN;
const EXO_VIRTUAL = process.env.EXO_VIRTUAL || '09513886363';
const ASTRO_NUMBER = process.env.ASTRO_NUMBER || '+919772304245';
const BACKEND_URL = process.env.BACKEND_URL || '';

if (!EXOTEL_SID || !EXOTEL_TOKEN) {
  console.warn('Warning: EXOTEL_SID or EXOTEL_TOKEN not set. Set environment variables before deploying.');
}

// Helper: call Exotel Connect
async function exotelCall(from, to, timeLimit = 300) {
  const url = `https://api.exotel.com/v1/Accounts/${EXOTEL_SID}/Calls/connect`;
  const params = {
    From: from,
    To: to,
    CallerId: EXO_VIRTUAL,
    Record: 'true',
    TimeLimit: String(timeLimit),
    StatusCallback: `${BACKEND_URL.replace(/\/$/, '')}/exotel-webhook`
  };

  const resp = await axios.post(url, qs.stringify(params), {
    auth: { username: EXOTEL_SID, password: EXOTEL_TOKEN },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  return resp.data;
}

// Free call endpoint (5 minutes)
app.post('/start-call', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: 'phone required' });
    const data = await exotelCall(phone, ASTRO_NUMBER, 300);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('start-call error', err.response?.data || err.message || err);
    return res.status(500).json({ success: false, error: 'Exotel error' });
  }
});

// Paid call endpoint
app.post('/start-paid-call', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: 'phone required' });
    const data = await exotelCall(phone, ASTRO_NUMBER, 1800); // 30 minutes
    return res.json({ success: true, data });
  } catch (err) {
    console.error('start-paid-call error', err.response?.data || err.message || err);
    return res.status(500).json({ success: false, error: 'Exotel error' });
  }
});

// Exotel webhook to receive recording URL, status, etc.
app.post('/exotel-webhook', (req, res) => {
  console.log('Exotel webhook payload:', req.body);
  // TODO: persist to DB or forward to admin/email
  res.sendStatus(200);
});

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
