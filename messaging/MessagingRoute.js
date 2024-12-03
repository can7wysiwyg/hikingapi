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




MessagingRoute.post('/send_message', asyncHandler(async(req, res) => {

    try {

        const { conversationId, senderId, content } = req.body;

        if (!conversationId || !senderId || !content) {
          return res.status(400).json({ msg: 'All fields are required.' });
        }
      
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ msg: 'Conversation not found.' });
      
        const newMessage = {
          sender: senderId,
          content,
        };
      
        conversation.messages.push(newMessage);
        conversation.lastMessage = content;
        conversation.updatedAt = Date.now();
      
        await conversation.save();
        res.json({ msg: 'Message sent successfully.', message: newMessage });
      

        
    } catch (error) {
        res.json({msg: `there was an error: ${error.message}`})
        
    }

}))



MessagingRoute.get('/conversations/:id', verify, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const conversations = await Conversation.find({
    participants: id,
  }).sort({ updatedAt: -1 });

  res.json(conversations);
}));


module.exports = MessagingRoute