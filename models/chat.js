const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat;
