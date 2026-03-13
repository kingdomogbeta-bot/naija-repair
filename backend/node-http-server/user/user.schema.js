const mongoose = require('mongoose');
const SCHEMA = mongoose.Schema;

const userSchema = new SCHEMA({
  name: {
    type: String,
    required: true,
    trim: true,
    min: [3, 'name should not be less than three characters']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    min: 8,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  state: {
    type: String
  },
  lga: {
    type: String
  },
  address: {
    type: String
  },
  landmark: {
    type: String
  },
  emergencyContact: {
    name: String,
    phone: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
