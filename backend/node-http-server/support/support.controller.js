const SupportMessage = require('./support.schema');

const generateTicketId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `NR-${timestamp}-${random}`.toUpperCase();
};

const getAIResponse = (userMessage, userName) => {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('good morning') || msg.includes('good afternoon') || msg.includes('good evening')) {
    return `Hello ${userName}! 👋 Welcome to Naija-Repair Support. I'm your AI assistant and I'm here to help you with any questions or concerns you might have. 

How can I assist you today? I can help with:
• Booking and scheduling services
• Payment and billing questions  
• Account management
• Technical issues
• General inquiries

Feel free to describe your issue and I'll do my best to help!`;
  }
  
  if (msg.includes('how') && (msg.includes('book') || msg.includes('hire') || msg.includes('schedule'))) {
    return `Great question! Here's how to book a service on Naija-Repair:

📱 **Step-by-Step Booking Process:**
1. Browse our Services page to see available categories
2. Select the service you need (cleaning, repairs, etc.)
3. Choose from available taskers in your area
4. Click "Book Now" on your preferred tasker
5. Fill in your service details, date, and time
6. Review and confirm your booking
7. Make secure payment to confirm

💡 **Pro Tips:**
• Check tasker reviews and ratings before booking
• Book in advance for better availability
• Provide clear service details for accurate quotes

Need help with a specific step? Just let me know!`;
  }
  
  if (msg.includes('payment') || msg.includes('pay') || msg.includes('billing') || msg.includes('charge')) {
    return `I'm here to help with payment questions! 💳

**Payment Methods We Accept:**
• Credit/Debit Cards (Visa, Mastercard)
• Bank Transfers
• Mobile Money (coming soon)

**Payment Process:**
• Payment is processed securely through Paystack
• You pay after booking confirmation
• Funds are held until service completion
• Taskers receive payment after job completion

**Common Payment Issues:**
• Failed payments: Check card details and try again
• Refunds: Processed within 5-7 business days
• Payment disputes: Contact us immediately

Is there a specific payment issue I can help resolve?`;
  }
  
  if (msg.includes('cancel') || msg.includes('refund') || msg.includes('money back')) {
    return `I understand you need help with cancellation or refunds. Here's our policy:

**Cancellation Policy:**
• ✅ Free cancellation 24+ hours before scheduled time
• ⚠️ 50% refund for cancellations 2-24 hours before
• ❌ No refund for cancellations less than 2 hours before

**Refund Process:**
• Refunds are processed within 5-7 business days
• Money returns to your original payment method
• You'll receive email confirmation when processed

**How to Cancel:**
1. Go to "My Bookings" page
2. Find your booking
3. Click "Cancel Booking"
4. Select cancellation reason

Need help canceling a specific booking? Please share your booking ID and I'll assist further!`;
  }
  
  if (msg.includes('price') || msg.includes('cost') || msg.includes('expensive') || msg.includes('cheap')) {
    return `Let me explain our pricing structure! 💰

**How Pricing Works:**
• Each tasker sets their own hourly rates
• Rates are clearly displayed on tasker profiles
• You see total estimated cost before booking
• No hidden fees or surprise charges

**Typical Price Ranges:**
• House Cleaning: ₦2,000 - ₦5,000/hour
• Handyman Services: ₦3,000 - ₦7,000/hour
• Plumbing: ₦4,000 - ₦8,000/hour
• Electrical Work: ₦4,500 - ₦9,000/hour

**Factors Affecting Price:**
• Tasker experience and ratings
• Service complexity
• Location and travel time
• Time of day/week

**Money-Saving Tips:**
• Compare multiple taskers
• Book during off-peak hours
• Bundle multiple tasks together

Looking for a specific service quote? I can help you find competitive rates!`;
  }
  
  if (msg.includes('tasker') && (msg.includes('late') || msg.includes('no show') || msg.includes('didn\'t come'))) {
    return `I'm sorry to hear about this issue! No-shows and late arrivals are taken seriously. 

**Immediate Steps:**
1. Wait 15 minutes past scheduled time
2. Try contacting the tasker directly through our app
3. If no response, report the issue immediately

**Our No-Show Policy:**
• Full refund for confirmed no-shows
• Automatic rescheduling options available
• Tasker penalties for repeated no-shows

**How to Report:**
• Use the "Report Issue" button in your booking
• Or contact support immediately
• We'll investigate and resolve within 2 hours

**We'll Help You:**
• Get immediate replacement tasker if available
• Process full refund if preferred
• Ensure this doesn't happen again

Would you like me to help you report this issue or find a replacement tasker?`;
  }
  
  if (msg.includes('account') || msg.includes('profile') || msg.includes('login') || msg.includes('password')) {
    return `I can help with account-related questions! 👤

**Common Account Issues:**
• **Forgot Password:** Use "Forgot Password" on login page
• **Email Not Verified:** Check spam folder for verification email
• **Profile Updates:** Go to Settings > Profile to make changes
• **Account Locked:** Contact support for immediate assistance

**Account Security Tips:**
• Use strong, unique passwords
• Enable two-factor authentication (coming soon)
• Keep your email address updated
• Log out from shared devices

**Profile Management:**
• Update contact information anytime
• Add profile photo for better experience
• Set notification preferences
• Manage payment methods

**Need Help With:**
• Changing email address
• Updating phone number
• Deleting account
• Privacy settings

What specific account issue can I help you resolve?`;
  }
  
  if (msg.includes('app') || msg.includes('website') || msg.includes('technical') || msg.includes('bug') || msg.includes('error')) {
    return `Technical issues can be frustrating! Let me help troubleshoot. 🔧

**Common Solutions:**
• **App Issues:** Update to latest version, restart app
• **Website Problems:** Clear browser cache, try different browser
• **Login Issues:** Check internet connection, verify credentials
• **Booking Errors:** Refresh page, try again in few minutes

**Quick Fixes:**
1. Close and reopen the app/browser
2. Check your internet connection
3. Clear app cache or browser data
4. Try using a different device

**Still Having Issues?**
Please share:
• What device/browser you're using
• What exactly happens when you try to [action]
• Any error messages you see
• When the problem started

**Emergency Contact:**
For urgent technical issues affecting active bookings, call our emergency line: [Emergency Number]

What specific technical issue are you experiencing?`;
  }
  
  if (msg.includes('quality') || msg.includes('complaint') || msg.includes('bad service') || msg.includes('unsatisfied')) {
    return `I'm sorry to hear you're not satisfied with the service quality. Your feedback is important to us! 

**Quality Assurance Process:**
• All taskers are vetted and trained
• Regular quality checks and reviews
• Customer feedback drives improvements
• Zero tolerance for poor service

**What You Can Do:**
1. **Rate & Review:** Share your experience to help others
2. **Report Issues:** Use the "Report Problem" feature
3. **Request Refund:** For unsatisfactory service
4. **Rebook:** We'll help you find a better tasker

**We'll Investigate:**
• Review tasker performance history
• Check service standards compliance
• Take appropriate action if needed
• Ensure better experience next time

**Immediate Resolution:**
• Partial or full refund if service was subpar
• Free re-service with different tasker
• Direct escalation to management if needed

Would you like to file a formal complaint or discuss a specific service issue?`;
  }
  
  // Default response for unmatched queries
  return `Thank you for contacting Naija-Repair Support! 🤖

I'm an AI assistant designed to help with common questions, but I can see your inquiry might need personalized attention from our human support team.

**What I've Done:**
✅ Created support ticket: [Ticket will be generated]
✅ Notified our support team
✅ Prioritized based on your message

**What Happens Next:**
• Our support team will review your message within 2 hours
• You'll receive a personalized response via email
• For urgent issues, we'll contact you directly
• You can track your ticket status in your account

**In the Meantime:**
• Check our FAQ section for quick answers
• Browse our Help Center for detailed guides
• Contact emergency line for urgent booking issues

**Average Response Times:**
• General inquiries: 2-4 hours
• Payment issues: 1-2 hours  
• Urgent problems: 30 minutes

Is there anything else I can help clarify while you wait for our team?`;
};

exports.createSupportTicket = async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;
    const userId = req.user._id || req.user.id;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const ticketId = generateTicketId();
    
    const supportTicket = await SupportMessage.create({
      ticketId,
      userId: userId.toString(),
      userEmail: req.user.email,
      userName: req.user.name,
      userRole: req.user.role || 'user',
      subject,
      category: category || 'general',
      priority: priority || 'medium',
      messages: [{
        senderId: userId.toString(),
        senderName: req.user.name,
        senderRole: req.user.role || 'user',
        message,
        timestamp: new Date()
      }],
      lastActivity: new Date()
    });

    // Send AI response
    setTimeout(async () => {
      const aiResponse = getAIResponse(message, req.user.name);
      await SupportMessage.findOneAndUpdate(
        { ticketId },
        {
          $push: {
            messages: {
              senderId: 'ai-assistant',
              senderName: 'Naija-Repair AI Assistant',
              senderRole: 'support',
              message: aiResponse,
              timestamp: new Date()
            }
          },
          lastActivity: new Date()
        }
      );

      if (global.io) {
        global.io.to(userId.toString()).emit('support_message', {
          ticketId,
          message: aiResponse,
          sender: 'AI Assistant'
        });
      }
    }, 1500);

    res.status(201).json({ 
      success: true, 
      data: supportTicket,
      message: 'Support ticket created successfully'
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getUserSupportTickets = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const tickets = await SupportMessage.find({ userId: userId.toString() })
      .sort({ lastActivity: -1 });
    
    res.json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSupportTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user._id || req.user.id;
    
    const ticket = await SupportMessage.findOne({ 
      ticketId, 
      userId: userId.toString() 
    });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }
    
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMessageToTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    const userId = req.user._id || req.user.id;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const ticket = await SupportMessage.findOneAndUpdate(
      { ticketId, userId: userId.toString() },
      {
        $push: {
          messages: {
            senderId: userId.toString(),
            senderName: req.user.name,
            senderRole: req.user.role || 'user',
            message,
            timestamp: new Date()
          }
        },
        lastActivity: new Date(),
        status: 'open'
      },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin functions
exports.getAllSupportTickets = async (req, res) => {
  try {
    const { status, priority, category } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const tickets = await SupportMessage.find(filter)
      .sort({ lastActivity: -1 });
    
    res.json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, assignedTo } = req.body;
    const adminId = req.user._id || req.user.id;

    const updateData = { lastActivity: new Date() };
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;
    
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = adminId.toString();
    }

    const ticket = await SupportMessage.findOneAndUpdate(
      { ticketId },
      updateData,
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminReplyToTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    const adminId = req.user._id || req.user.id;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const ticket = await SupportMessage.findOneAndUpdate(
      { ticketId },
      {
        $push: {
          messages: {
            senderId: adminId.toString(),
            senderName: req.user.name || 'Support Team',
            senderRole: 'admin',
            message,
            timestamp: new Date()
          }
        },
        lastActivity: new Date(),
        status: 'in-progress'
      },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    // Notify user
    if (global.io) {
      global.io.to(ticket.userId).emit('support_message', {
        ticketId,
        message,
        sender: 'Support Team'
      });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;