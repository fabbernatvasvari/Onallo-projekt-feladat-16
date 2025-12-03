import express from 'express';

const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    { id: 1, sender_id: 1, recipient_id: 2, content: 'Szia Anna!', created_at: new Date().toISOString(), is_read: false },
    { id: 2, sender_id: 2, recipient_id: 1, content: 'Szia! Hogy vagy?', created_at: new Date().toISOString(), is_read: false },
    { id: 3, sender_id: 1, recipient_id: 3, content: 'Helló Péter!', created_at: new Date().toISOString(), is_read: false },
    { id: 4, sender_id: 3, recipient_id: 1, content: 'Szia! Miben segíthetek?', created_at: new Date().toISOString(), is_read: false }
    ]);
});

router.post("/", (req, res) => {
  const newMessage = req.body;
  res.json({ message: "Message sent", messageData: newMessage });
});

export default router;