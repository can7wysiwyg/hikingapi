const MessagingRoute = require('express').Router()
const asyncHandler = require("express-async-handler");
const verify = require("../middleware/verify");
const Conversation = require('../models/MessageModel')
const NotificationService = require('../notifications/NotificationServices')
const User = require('../models/UserModel')



MessagingRoute.post('/send_message', verify, asyncHandler(async (req, res) => {
  try {
    const { conversationId, senderId, content, receiverId } = req.body;

    if (!conversationId || !senderId || !content || !receiverId) {
      return res.status(400).json({ msg: 'All fields are required.' });
    }

    // Find conversation, sender, and receiver details
    const [conversation, sender, receiver] = await Promise.all([
      Conversation.findById(conversationId),
      User.findById(senderId),
      User.findById(receiverId)
    ]);

    if (!conversation) return res.json({ msg: 'Conversation not found.' });
    if (!sender) return res.json({ msg: 'Sender not found.' });
    if (!receiver) return res.json({ msg: 'Receiver not found.' });

    const newMessage = {
      receiver: receiverId,
      sender: senderId,
      content,
      timestamp: new Date(),
      notificationStatus: 'pending'
    };

    

    // Update conversation with the new message
    conversation.messages.push(newMessage);
    conversation.lastMessage = content;
    conversation.updatedAt = Date.now();

    try {
      // Send FCM notification after successfully sending the message
      await NotificationService.sendFCMNotification(receiver, sender, content, conversationId, newMessage._id, senderId);

      // Mark notification as sent
      newMessage.notificationStatus = 'sent';
      newMessage.notificationSent = true;
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      newMessage.notificationStatus = 'failed';
    }

    // Save the conversation after adding the message
    await conversation.save();

    // Prepare notification data to send back in the response
    const notificationData = {
      message: newMessage,
      senderName: sender.fullname,
      content: content.substring(0, 100),
      conversationId,
      messageId: newMessage._id
    };

  

    res.json({
      msg: 'Message sent successfully.',
      message: newMessage,
      notification: notificationData, // Optionally return for immediate frontend consumption
    });

  } catch (error) {
  
    res.json({ msg: `There was an error: ${error.message}` });
  }
}));







MessagingRoute.post('/start_conversation', verify, asyncHandler(async(req, res) => {


    try {

      

        const { senderId, recipientId } = req.body;

        

        if (!senderId || !recipientId) {
          return res.status(400).json({ msg: 'Sender and recipient are required.' });
        }
      
        let conversation = await Conversation.findOne({
          participants: { $all: [senderId, recipientId] },
        });
      
        if (!conversation) {
          conversation = new Conversation({
            participants: [senderId, recipientId],
          });
          await conversation.save();
        }
      
        res.json({conversation});
      


        
    } catch (error) {
        res.json({msg: `there was an error: ${error.message}`})
        
    }


}))




MessagingRoute.get('/get_my_messages/:id',  asyncHandler(async(req, res) => {


  try {

    const {id} = req.params

    const convo = await Conversation.findById(id)

    res.json({convo})
    
  } catch (error) {
    res.json({msg: `there was an error: ${error.message}`})
        
    
  }

}))




MessagingRoute.get('/conversations/:id', verify,  asyncHandler(async (req, res) => {
  const { id } = req.params;

  const conversations = await Conversation.find({
    participants: id,
  }).sort({ updatedAt: -1 });

  res.json(conversations);
}));


MessagingRoute.get('/unread_messages', verify, async (req, res) => {
  try {
    const userId = req.user._id;
    const unreadCount = await Conversation.aggregate([
      { $match: { 'participants': userId } },
      { $unwind: '$messages' },
      { $match: { 'messages.isRead': false, 'messages.receiver': userId } },
      { $count: 'unreadMessages' }
    ]);

    res.json({ unreadCount: unreadCount.length ? unreadCount[0].unreadMessages : 0 });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving unread messages' });
  }
});


MessagingRoute.post('/mark_messages_as_read', verify, async (req, res) => {
  try {
    const { conversationId, userId } = req.body;

    result = await Conversation.updateMany(
      {
        _id: conversationId,
        'messages.receiver': userId,
        'messages.isRead': false,
      },
      {
        $set: { 'messages.$[elem].isRead': true },
      },
      {
        arrayFilters: [{ 'elem.receiver': userId, 'elem.isRead': false }],
      }
    );

    
    // Retrieve the updated conversation for inspection
    const updatedConversation = await Conversation.findById(conversationId);

    if (result.nModified > 0) {
      // Check if any messages are marked as read
      const unreadMessages = updatedConversation.messages.filter(
        (message) => message.receiver.toString() === userId && !message.isRead
      );

      if (unreadMessages.length === 0) {
        res.json({ message: 'Messages marked as read' });
      } else {
        // In case there are still unread messages
        
        res.json({ message: 'Failed to mark all messages as read' });
      }
    } else {
      res.json({ message: 'No unread messages found' });
    }

    
      } catch (error) {

        
    res.status(500).json({ message: 'Error marking messages as read' });
  }
});


module.exports = MessagingRoute