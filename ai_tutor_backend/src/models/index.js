const mongoose = require('mongoose');

const ChatHistory = require('./chatHistory');
const Chat = require('./chatModel');
const User = require('./user');

module.exports = {
  ChatHistory,
  Chat,
  User
};