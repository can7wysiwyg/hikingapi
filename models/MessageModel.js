const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  
});

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  messages: [MessageSchema], // Array of messages
  lastMessage: { type: String }, // For easy preview in UI
  updatedAt: { type: Date, default: Date.now },
}, {

    timestamps: true
});

module.exports = mongoose.model('Conversation', ConversationSchema);



