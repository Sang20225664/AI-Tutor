const mongoose = require('mongoose');

const ChatHistory = require('./chatHistory');
const Chat = require('./chatModel');
const User = require('./User');
const Lesson = require('./lesson');
const Subject = require('./subject');
const Quiz = require('./quiz');
const LessonSuggestion = require('./lessonSuggestion');

module.exports = {
  User,
  ChatHistory,
  Chat,
  Lesson,
  Subject,
  Quiz,
  LessonSuggestion
};