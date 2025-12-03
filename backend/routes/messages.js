import express from 'express';

const router = express.Router();

// Sample messages database
const messages = [
  { id: 1, sender_id: 1, recipient_id: 2, content: 'Szia Anna!', created_at: new Date().toISOString(), is_read: false },
  { id: 2, sender_id: 2, recipient_id: 1, content: 'Szia! Hogy vagy?', created_at: new Date().toISOString(), is_read: false },
  { id: 3, sender_id: 1, recipient_id: 3, content: 'Helló Péter!', created_at: new Date().toISOString(), is_read: false },
  { id: 4, sender_id: 3, recipient_id: 1, content: 'Szia! Miben segíthetek?', created_at: new Date().toISOString(), is_read: false }
];

// GET /api/messages - get all messages
router.get("/", (req, res) => {
  res.json(messages);
});

// GET /api/messages/conversation/:userId - get conversation between two users
router.get("/conversation/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const conversation = messages.filter(m => 
    (m.sender_id === userId || m.recipient_id === userId)
  );
  res.json(conversation);
});

// GET /api/messages/thread/:id - get replies to a specific message
router.get("/thread/:id", (req, res) => {
  const messageId = parseInt(req.params.id);
  const thread = messages.filter(m => m.parent_msg_id === messageId);
  res.json(thread);
});

// POST /api/messages - send a new message
router.post("/", (req, res) => {
  const { sender_id, recipient_id, content } = req.body;
  
  if (!sender_id || !recipient_id || !content) {
    return res.status(400).json({ message: 'sender_id, recipient_id, and content are required' });
  }

  const newMessage = {
    id: messages.length + 1,
    sender_id,
    recipient_id,
    content,
    created_at: new Date().toISOString(),
    is_read: false
  };

  messages.push(newMessage);
  res.status(201).json({ message: "Message sent", messageData: newMessage });
});

// POST /api/messages/reply - send a reply to a message
router.post("/reply", (req, res) => {
  const { parent_id, sender_id, recipient_id, content } = req.body;

  if (!parent_id || !sender_id || !recipient_id || !content) {
    return res.status(400).json({ message: 'parent_id, sender_id, recipient_id, and content are required' });
  }

  const newReply = {
    id: messages.length + 1,
    parent_msg_id: parent_id,
    sender_id,
    recipient_id,
    content,
    created_at: new Date().toISOString(),
    is_read: false
  };

  messages.push(newReply);
  res.status(201).json({ message: "Reply sent", messageData: newReply });
});

export default router;
