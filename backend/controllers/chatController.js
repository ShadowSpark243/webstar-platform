const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── Helpers ─────────────────────────────────────────────────────────────────

const MAX_MESSAGE_LENGTH = 2000;
const MAX_SUBJECT_LENGTH = 150;

/* Strip HTML tags / script injections from user input */
function sanitize(str) {
      if (typeof str !== 'string') return '';
      return str
            .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .trim();
}

// ── USER CONTROLLERS ─────────────────────────────────────────────────────────

/**
 * POST /api/chat/tickets
 * Create a new support ticket with an opening message.
 */
const createTicket = async (req, res) => {
      try {
            const { subject, message } = req.body;
            const userId = req.user.id;

            const cleanSubject = sanitize(subject);
            const cleanMessage = sanitize(message);

            if (!cleanSubject || cleanSubject.length > MAX_SUBJECT_LENGTH) {
                  return res.status(400).json({ success: false, message: `Subject is required and must be under ${MAX_SUBJECT_LENGTH} characters.` });
            }
            if (!cleanMessage || cleanMessage.length > MAX_MESSAGE_LENGTH) {
                  return res.status(400).json({ success: false, message: `Message is required and must be under ${MAX_MESSAGE_LENGTH} characters.` });
            }

            // Since the Prisma Client might not be fully regenerated yet,
            // we create the ticket and message sequentially instead of nested.
            const ticket = await prisma.supportTicket.create({
                  data: {
                        userId,
                        subject: cleanSubject,
                  },
            });

            const initialMessage = await prisma.supportMessage.create({
                  data: {
                        ticketId: ticket.id,
                        senderId: userId,
                        senderRole: 'USER',
                        message: cleanMessage,
                  }
            });

            // Return the structure expected by the frontend
            const ticketWithMessages = {
                  ...ticket,
                  messages: [initialMessage]
            };

            res.status(201).json({ success: true, ticket: ticketWithMessages });
      } catch (err) {
            console.error('createTicket error:', err);
            res.status(500).json({ success: false, message: 'Failed to create ticket.' });
      }
};

/**
 * GET /api/chat/tickets
 * Get all tickets for the authenticated user.
 */
const getUserTickets = async (req, res) => {
      try {
            const tickets = await prisma.supportTicket.findMany({
                  where: { userId: req.user.id },
                  orderBy: { updatedAt: 'desc' },
                  include: {
                        messages: {
                              orderBy: { createdAt: 'desc' },
                              take: 1, // last message preview
                        },
                  },
            });
            res.json({ success: true, tickets });
      } catch (err) {
            console.error('getUserTickets error:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch tickets.' });
      }
};

/**
 * GET /api/chat/tickets/:id/messages
 * Get full message thread for a specific ticket (ownership enforced).
 */
const getTicketMessages = async (req, res) => {
      try {
            const ticketId = parseInt(req.params.id);
            if (isNaN(ticketId)) return res.status(400).json({ success: false, message: 'Invalid ticket ID.' });

            const ticket = await prisma.supportTicket.findUnique({
                  where: { id: ticketId },
                  include: {
                        messages: { orderBy: { createdAt: 'asc' } },
                  },
            });

            if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

            // Ownership check — only the ticket owner or an admin can read it
            if (ticket.userId !== req.user.id && req.user.role !== 'ADMIN') {
                  return res.status(403).json({ success: false, message: 'Access denied.' });
            }

            res.json({ success: true, ticket });
      } catch (err) {
            console.error('getTicketMessages error:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
      }
};

/**
 * POST /api/chat/tickets/:id/messages
 * User sends a message to their own ticket.
 */
const sendUserMessage = async (req, res) => {
      try {
            const ticketId = parseInt(req.params.id);
            if (isNaN(ticketId)) return res.status(400).json({ success: false, message: 'Invalid ticket ID.' });

            const cleanMessage = sanitize(req.body.message);
            if (!cleanMessage || cleanMessage.length > MAX_MESSAGE_LENGTH) {
                  return res.status(400).json({ success: false, message: `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters.` });
            }

            const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
            if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });
            if (ticket.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied.' });
            if (ticket.status === 'CLOSED') return res.status(400).json({ success: false, message: 'This ticket is closed. Please open a new ticket.' });

            const [msg] = await prisma.$transaction([
                  prisma.supportMessage.create({
                        data: {
                              ticketId,
                              senderId: req.user.id,
                              senderRole: 'USER',
                              message: cleanMessage,
                        },
                  }),
                  prisma.supportTicket.update({
                        where: { id: ticketId },
                        data: { updatedAt: new Date() },
                  }),
            ]);

            res.status(201).json({ success: true, message: msg });
      } catch (err) {
            console.error('sendUserMessage error:', err);
            res.status(500).json({ success: false, message: 'Failed to send message.' });
      }
};

// ── ADMIN CONTROLLERS ────────────────────────────────────────────────────────

/**
 * GET /api/admin/tickets
 * Admin: get all tickets with optional status filter.
 */
const getAllTickets = async (req, res) => {
      try {
            const { status } = req.query;
            const where = status && ['OPEN', 'IN_PROGRESS', 'CLOSED'].includes(status) ? { status } : {};

            const tickets = await prisma.supportTicket.findMany({
                  where,
                  orderBy: { updatedAt: 'desc' },
                  include: {
                        user: { select: { id: true, fullName: true, username: true, email: true } },
                        messages: {
                              orderBy: { createdAt: 'desc' },
                              take: 1,
                        },
                        _count: { select: { messages: true } },
                  },
            });

            res.json({ success: true, tickets });
      } catch (err) {
            console.error('getAllTickets error:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch tickets.' });
      }
};

/**
 * GET /api/admin/tickets/:id/messages
 * Admin: get full thread for any ticket.
 */
const adminGetTicketMessages = async (req, res) => {
      try {
            const ticketId = parseInt(req.params.id);
            if (isNaN(ticketId)) return res.status(400).json({ success: false, message: 'Invalid ticket ID.' });

            const ticket = await prisma.supportTicket.findUnique({
                  where: { id: ticketId },
                  include: {
                        user: { select: { id: true, fullName: true, username: true, email: true } },
                        messages: { orderBy: { createdAt: 'asc' } },
                  },
            });

            if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });
            res.json({ success: true, ticket });
      } catch (err) {
            console.error('adminGetTicketMessages error:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
      }
};

/**
 * POST /api/admin/tickets/:id/messages
 * Admin replies to a ticket.
 */
const adminReply = async (req, res) => {
      try {
            const ticketId = parseInt(req.params.id);
            if (isNaN(ticketId)) return res.status(400).json({ success: false, message: 'Invalid ticket ID.' });

            const cleanMessage = sanitize(req.body.message);
            if (!cleanMessage || cleanMessage.length > MAX_MESSAGE_LENGTH) {
                  return res.status(400).json({ success: false, message: `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters.` });
            }

            const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
            if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });
            if (ticket.status === 'CLOSED') return res.status(400).json({ success: false, message: 'Ticket is closed.' });

            const [msg] = await prisma.$transaction([
                  prisma.supportMessage.create({
                        data: {
                              ticketId,
                              senderId: req.user.id,
                              senderRole: 'ADMIN',
                              message: cleanMessage,
                        },
                  }),
                  prisma.supportTicket.update({
                        where: { id: ticketId },
                        data: { status: 'IN_PROGRESS', updatedAt: new Date() },
                  }),
            ]);

            res.status(201).json({ success: true, message: msg });
      } catch (err) {
            console.error('adminReply error:', err);
            res.status(500).json({ success: false, message: 'Failed to send reply.' });
      }
};

/**
 * PUT /api/admin/tickets/:id/status
 * Admin changes ticket status.
 */
const updateTicketStatus = async (req, res) => {
      try {
            const ticketId = parseInt(req.params.id);
            if (isNaN(ticketId)) return res.status(400).json({ success: false, message: 'Invalid ticket ID.' });

            const { status } = req.body;
            if (!['OPEN', 'IN_PROGRESS', 'CLOSED'].includes(status)) {
                  return res.status(400).json({ success: false, message: 'Invalid status value.' });
            }

            const ticket = await prisma.supportTicket.update({
                  where: { id: ticketId },
                  data: { status },
            });

            res.json({ success: true, ticket });
      } catch (err) {
            console.error('updateTicketStatus error:', err);
            res.status(500).json({ success: false, message: 'Failed to update status.' });
      }
};

module.exports = {
      createTicket,
      getUserTickets,
      getTicketMessages,
      sendUserMessage,
      getAllTickets,
      adminGetTicketMessages,
      adminReply,
      updateTicketStatus,
};
