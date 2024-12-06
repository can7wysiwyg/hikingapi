const MessagingRoute = require('express').Router()
const asyncHandler = require("express-async-handler");
const verify = require("../middleware/verify");
const Conversation = require('../models/MessageModel')


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




// MessagingRoute.post('/send_message', asyncHandler(async(req, res) => {

//     try {

//         const { conversationId, senderId, content, receiverId } = req.body;

//         if (!conversationId || !senderId || !content) {
//           return res.status(400).json({ msg: 'All fields are required.' });
//         }
      
//         const conversation = await Conversation.findById(conversationId);
//         if (!conversation) return res.status(404).json({ msg: 'Conversation not found.' });
      
//         const newMessage = {
//           receiver: receiverId,
//           sender: senderId,
//           content,
//         };
      
//         conversation.messages.push(newMessage);
//         conversation.lastMessage = content;
//         conversation.updatedAt = Date.now();
      
//         await conversation.save();
//         res.json({ msg: 'Message sent successfully.', message: newMessage });
      

        
//     } catch (error) {
//         res.json({msg: `there was an error: ${error.message}`})
        
//     }

// }))


MessagingRoute.post('/send_message', asyncHandler(async (req, res) => {
  try {
      const { conversationId, senderId, content, receiverId } = req.body;

      if (!conversationId || !senderId || !content || !receiverId) {
          return res.status(400).json({ msg: 'All fields are required.' });
      }

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return res.status(404).json({ msg: 'Conversation not found.' });

      const newMessage = {
          receiver: receiverId,
          sender: senderId,
          content,
          timestamp: new Date(),
      };

      conversation.messages.push(newMessage);
      conversation.lastMessage = content;
      conversation.updatedAt = Date.now();

      await conversation.save();

      // Send notification-like response
      const notificationData = getVals(senderId, receiverId);

      res.json({
          msg: 'Message sent successfully.',
          message: newMessage,
          notification: notificationData, // Optionally return for immediate frontend consumption
      });
  } catch (error) {
      res.status(500).json({ msg: `There was an error: ${error.message}` });
  }
}));

// Utility function to structure notification data
function getVals(senderId, receiverId) {
  return {
      senderId,
      receiverId,
      message: 'You have a new message!', // Can be enhanced with content if needed
  };
}



MessagingRoute.get('/get_my_messages/:id', verify, asyncHandler(async(req, res) => {


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



MessagingRoute.get('/notifications/:receiverId', asyncHandler(async (req, res) => {
  try {
      const { receiverId } = req.params;

      // Find messages for the receiver that haven't been read
      const conversations = await Conversation.find({
          'messages.receiver': receiverId,
          'messages.isRead': false,
      });

      const unreadMessages = conversations.flatMap(conversation =>
          conversation.messages.filter(msg => msg.receiver === receiverId && !msg.isRead)
      );

      res.json({ notifications: unreadMessages });
  } catch (error) {
      res.status(500).json({ msg: `There was an error: ${error.message}` });
  }
}));



module.exports = MessagingRoute