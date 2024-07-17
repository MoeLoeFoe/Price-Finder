// server.js
const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

let latestData = [];

app.post('/api/receive-data', (req, res) => {
  latestData = req.body;
  res.json({ status: 'received', data: latestData });
});

app.get('/api/fetch-data', (req, res) => {
  res.json(latestData);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});