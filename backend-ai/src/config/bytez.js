const axios = require('axios');
const http = require('http');
const https = require('https');

// Configure Bytez API client
const bytezClient = axios.create({
  baseURL: process.env.BYTEZ_API_URL || 'https://api.bytez.com/v1',
  headers: {
    'Authorization': `Bearer ${process.env.BYTEZ_API_KEY}`,
    'Content-Type': 'application/json'
  },
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true })
});

module.exports = {
  bytezClient
};
