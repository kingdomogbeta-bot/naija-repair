const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

const dbstring = process.env.DBSTRING;

dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    console.log('connecting to db......');
    await mongoose.connect(dbstring, {
      serverSelectionTimeoutMS: 30000,
      family: 4
    });
    console.log('connection to db successful');
  } catch (error) {
    console.log('error connecting to db.....', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
