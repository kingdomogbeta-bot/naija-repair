require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./dbconnection');
const { checkMaintenance } = require('./middleware/maintenance');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

connectDB();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));
app.use(cors({
  origin: ['https://naija-repair-rd5j.onrender.com', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files with proper headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.use('/api/settings', require('./settings/settings.router'));
app.use(checkMaintenance);

app.use('/api/users', require('./user/user.router'));
app.use('/api/taskers', require('./tasker/tasker.router'));
app.use('/api/email', require('./msgmicroservices/email.router'));
app.use('/api/payment', require('./payment/payment.router'));
app.use('/api/wallet', require('./wallet/wallet.router'));
app.use('/api/bookings', require('./booking/booking.router'));
app.use('/api/reviews', require('./review/review.router'));
app.use('/api/notifications', require('./notification/notification.router'));
app.use('/api/messages', require('./message/message.router'));
app.use('/api/support', require('./support/support.router'));
app.use('/api/favorites', require('./favorite/favorite.router'));
app.use('/api/services', require('./service/service.router'));
app.use('/api/safety', require('./safety/safety.router'));
app.use('/api/appeals', require('./appeal/appeal.router'));
app.use('/api/reports', require('./report/report.router'));

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(userId);
    console.log(`✅ User ${userId} connected and joined room`);
  } else {
    console.log('⚠️ User connected without userId');
  }
  
  socket.on('disconnect', () => {
    console.log(`❌ User ${userId || 'unknown'} disconnected`);
  });
});

global.io = io;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
