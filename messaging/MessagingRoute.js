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


MessagingRoute.post('/send_message', verify, asyncHandler(async (req, res) => {
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
      message: 'You have a new message!', 
  };
}




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

    // Log the update result for debugging
    console.log('Update Result:', result);

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
        console.error('Some messages are still unread.');
        res.json({ message: 'Failed to mark all messages as read' });
      }
    } else {
      res.json({ message: 'No unread messages found' });
    }

    
      } catch (error) {

        console.error(error)
  
    res.status(500).json({ message: 'Error marking messages as read' });
  }
});


module.exports = MessagingRoute