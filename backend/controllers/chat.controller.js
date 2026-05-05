const Message = require('../models/Message.model');
const User = require('../models/User.model');

// Fetch all registered users to populate the chat sidebar
exports.getUsers = async (req, res) => {
  try {
    // Exclude the current user from the list
    const users = await User.find({ _id: { $ne: req.user.userId } })
      .select('username email role');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.userId;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// Get conversation between the logged-in user and another user
exports.getConversation = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    }).sort({ createdAt: 1 }); // Oldest first for chat flow

    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error fetching conversation' });
  }
};
