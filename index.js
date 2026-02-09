const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.status(200).send('Jaidar Backend API is running 🚀');
});

app.get('/api/properties', async (req, res) => {
  try {
    const response = await axios.get('https://api.srminternationalrealestate.ae/api/properties');
    console.log(response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching properties:', error.message);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
