const mongoose = require('mongoose');

const forumAnswerSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumTopic',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('ForumAnswer', forumAnswerSchema);
