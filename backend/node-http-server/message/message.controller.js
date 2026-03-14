const Message = require('./message.schema');

const generateConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, receiverEmail, receiverName, message } = req.body;
    const senderId = req.user._id || req.user.id;

    console.log('Send message request:', { receiverId, receiverEmail, receiverName, message, senderId });

    if (!receiverId || !receiverEmail || !receiverName || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const conversationId = generateConversationId(senderId, receiverId);

    const newMessage = await Message.create({
      conversationId,
      senderId: senderId,
      senderEmail: req.user.email,
      senderName: req.user.name,
      receiverId,
      receiverEmail,
      receiverName,
      message
    });

    if (global.io) {
      global.io.to(receiverId).emit('new_message', newMessage);
    }

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id || req.user.id;
    const conversationId = generateConversationId(currentUserId, userId);

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const messages = await Message.find({
      $and: [
        {
          $or: [
            { senderId: currentUserId },
            { receiverId: currentUserId }
          ]
        },
        // Exclude support-related messages
        {
          $and: [
            { receiverId: { $ne: 'support-user-id' } },
            { senderId: { $ne: 'support-user-id' } },
            { receiverEmail: { $ne: 'support@naija-repair.com' } },
            { senderEmail: { $ne: 'support@naija-repair.com' } }
          ]
        }
      ]
    }).sort({ createdAt: -1 });

    const conversationsMap = new Map();
    
    messages.forEach(msg => {
      const otherUserId = msg.senderId === currentUserId.toString() ? msg.receiverId : msg.senderId;
      
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          userEmail: msg.senderId === currentUserId.toString() ? msg.receiverEmail : msg.senderEmail,
          userName: msg.senderId === currentUserId.toString() ? msg.receiverName : msg.senderName,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount: 0
        });
      }

      if (msg.receiverId === currentUserId.toString() && !msg.read) {
        conversationsMap.get(otherUserId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());
    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id || req.user.id;
    const conversationId = generateConversationId(currentUserId, userId);

    await Message.updateMany(
      { conversationId, receiverId: currentUserId, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const currentUserId = req.user._id || req.user.id;
    if (message.senderId !== currentUserId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllMessagesAdmin = async (req, res) => {
  try {
    const adminEmail = process.env.EMAIL;
    const messages = await Message.find({
      senderEmail: { $ne: adminEmail },
      receiverEmail: { $ne: adminEmail }
    }).sort({ createdAt: -1 });

    const conversationsMap = new Map();
    messages.forEach(msg => {
      if (!conversationsMap.has(msg.conversationId)) {
        conversationsMap.set(msg.conversationId, {
          conversationId: msg.conversationId,
          participants: [
            { id: msg.senderId, name: msg.senderName, email: msg.senderEmail },
            { id: msg.receiverId, name: msg.receiverName, email: msg.receiverEmail }
          ],
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          messages: []
        });
      }
    });

    // Attach messages in chronological order per conversation
    const msgsByConv = new Map();
    [...messages].reverse().forEach(msg => {
      if (!msgsByConv.has(msg.conversationId)) msgsByConv.set(msg.conversationId, []);
      msgsByConv.get(msg.conversationId).push(msg);
    });

    const conversations = Array.from(conversationsMap.values()).map(conv => ({
      ...conv,
      messages: msgsByConv.get(conv.conversationId) || []
    }));

    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const count = await Message.countDocuments({ receiverId: currentUserId, read: false });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
