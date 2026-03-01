const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
      createTicket,
      getUserTickets,
      getTicketMessages,
      sendUserMessage,
      getAllTickets,
      adminGetTicketMessages,
      adminReply,
      updateTicketStatus,
} = require('../controllers/chatController');

// ── User Routes (authenticated users only) ────────────────────────────────────
router.use(protect);

router.post('/tickets', createTicket);
router.get('/tickets', getUserTickets);
router.get('/tickets/:id/messages', getTicketMessages);
router.post('/tickets/:id/messages', sendUserMessage);

// ── Admin Routes (admin only) ─────────────────────────────────────────────────
router.get('/admin/tickets', adminOnly, getAllTickets);
router.get('/admin/tickets/:id/messages', adminOnly, adminGetTicketMessages);
router.post('/admin/tickets/:id/messages', adminOnly, adminReply);
router.put('/admin/tickets/:id/status', adminOnly, updateTicketStatus);

module.exports = router;
