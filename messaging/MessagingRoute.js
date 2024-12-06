const MessagingRoute = require('express').Router()
const asyncHandler = require("express-async-handler");
const verify = require("../middleware/verify");
const Conversation = require('../models/MessageModel')
const PushToken = require('../models/PushTokenModel')
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

// Example function for sending push notification
async function sendNotification(tokens, message) {
  const notifications = tokens.map(token => ({
    to: token,
    sound: 'default',
    title: 'New Message',
    body: message,
  }));

  try {
    const chunks = expo.chunkPushNotifications(notifications);
    const tickets = await Promise.all(
      chunks.map(chunk => expo.sendPushNotificationsAsync(chunk))
    );
    console.log('Push notifications sent:', tickets);
  } catch (error) {
    console.error('Error sending push notifications:', error);
  }
}











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


// MessagingRoute.post('/send_message', asyncHandler(async (req, res) => {
//   try {
//       const { conversationId, senderId, content, receiverId } = req.body;

//       if (!conversationId || !senderId || !content || !receiverId) {
//           return res.status(400).json({ msg: 'All fields are required.' });
//       }

//       const conversation = await Conversation.findById(conversationId);
//       if (!conversation) return res.status(404).json({ msg: 'Conversation not found.' });

//       const newMessage = {
//           receiver: receiverId,
//           sender: senderId,
//           content,
//           timestamp: new Date(),
//       };

//       conversation.messages.push(newMessage);
//       conversation.lastMessage = content;
//       conversation.updatedAt = Date.now();

//       await conversation.save();

//       // Send notification-like response
//       const notificationData = getVals(senderId, receiverId);

//       res.json({
//           msg: 'Message sent successfully.',
//           message: newMessage,
//           notification: notificationData, // Optionally return for immediate frontend consumption
//       });
//   } catch (error) {
//       res.status(500).json({ msg: `There was an error: ${error.message}` });
//   }
// }));

// // Utility function to structure notification data
// function getVals(senderId, receiverId) {
//   return {
//       senderId,
//       receiverId,
//       message: 'You have a new message!', 
//   };
// }


MessageRoute.post('/send_message', asyncHandler(async (req, res) => {
  try {
    const { conversationId, senderId, content, receiverId, receiverToken } = req.body;

    // Ensure all required fields are present
    if (!conversationId || !senderId || !content || !receiverId) {
      return res.status(400).json({ msg: 'Missing required fields.' });
    }

    // Save the message logic (example, adjust to your DB model)
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

    // Send push notification if a valid Expo token is provided
    if (receiverToken && Expo.isExpoPushToken(receiverToken)) {
      await sendNotification([receiverToken], `${senderId} sent you a message: ${content}`);
    }

    res.json({
      msg: 'Message sent and notification dispatched.',
      message: newMessage,
    });
  } catch (error) {
    res.status(500).json({ msg: `Error: ${error.message}` });
  }
}));





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


MessagingRoutepost('/save_push_token', asyncHandler(async (req, res) => {
  try {
    const { token, userId } = req.body;

    if (!token || !userId) {
      return res.status(400).json({ msg: 'Token and userId are required.' });
    }

    // Check if a token already exists for this user
    const existingToken = await PushToken.findOne({ userId });

    if (existingToken) {
      // Update the existing token
      existingToken.token = token;
      await existingToken.save();
      return res.status(200).json({ msg: 'Token updated successfully.', token: existingToken });
    }

    // Create a new push token record
    const newToken = new PushToken({ userId, token });
    await newToken.save();

    res.status(201).json({ msg: 'Token saved successfully.', token: newToken });
  } catch (error) {
    console.error('Error saving token:', error);
    res.status(500).json({ msg: `Error saving token: ${error.message}` });
  }
}));




module.exports = MessagingRoute