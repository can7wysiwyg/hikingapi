const mongoose = require('mongoose');

// const MessageSchema = new mongoose.Schema({
//   sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   content: { type: String, required: true },
//   isRead: { type: Boolean, default: false },
//   timestamp: { type: Date, default: Date.now },
  
// });

// const ConversationSchema = new mongoose.Schema({
//   participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
//   messages: [MessageSchema], // Array of messages
//   lastMessage: { type: String }, // For easy preview in UI
//   updatedAt: { type: Date, default: Date.now },
// }, {

//     timestamps: true
// });

// module.exports = mongoose.model('Conversation', ConversationSchema);



const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  notificationSent: { type: Boolean, default: false }, // Track if notification was sent
  notificationStatus: {
    type: String,
    enum: ['pending', 'sent', 'failed', null],
    default: null
  }
});

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  messages: [MessageSchema],
  lastMessage: { type: String },
  lastMessageAt: { type: Date, default: Date.now }, // Explicit last message timestamp
  participantsLastRead: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastRead: { type: Date, default: null }
  }],
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Add methods to the schemas
MessageSchema.methods.markNotificationSent = async function() {
  this.notificationSent = true;
  this.notificationStatus = 'sent';
  return this.save();
};

ConversationSchema.methods.markLastRead = async function(userId) {
  const participantRead = this.participantsLastRead.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (participantRead) {
    participantRead.lastRead = new Date();
  } else {
    this.participantsLastRead.push({
      user: userId,
      lastRead: new Date()
    });
  }
  
  return this.save();
};

module.exports = mongoose.model('Conversation', ConversationSchema);
