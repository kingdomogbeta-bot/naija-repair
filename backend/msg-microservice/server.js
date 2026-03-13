require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dns = require('dns');

const app = express();

dns.setServers(['8.8.8.8', '8.8.4.4']);

const DBSTRING = process.env.DBSTRING || 'mongodb+srv://kingnice7755_db_user:89RwvsHRBDXDNiVA@cluster0.hayypiv.mongodb.net/Naija-Repair?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(DBSTRING, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4
}).then(() => {
  console.log('✓ Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err.message);
});

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/email', (req, res, next) => {
  console.log('🌐 REQUEST TO /api/email:', req.method, req.path);
  console.log('🌐 Request body:', req.body);
  next();
}, require('./email/email.router'));

app.get('/', (req, res) => {
  res.json({ message: 'Message microservice is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'msg-microservice', timestamp: new Date() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Message microservice running on http://localhost:${PORT}`);
});

