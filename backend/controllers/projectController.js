const prisma = require('../utils/db');

// Get all active projects (for users)
exports.getActiveProjects = async (req, res) => {
      try {
            const projects = await prisma.project.findMany({
                  where: { status: { in: ['COMING_SOON', 'OPEN', 'FUNDED'] } },
                  orderBy: { createdAt: 'desc' },
                  include: {
                        _count: { select: { investments: true } }
                  }
            });
            res.status(200).json({ success: true, projects });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};

// Get single project details
exports.getProjectById = async (req, res) => {
      try {
            const { id } = req.params;
            const project = await prisma.project.findUnique({
                  where: { id: parseInt(id) },
                  include: {
                        _count: { select: { investments: true } }
                  }
            });

            if (!project) {
                  return res.status(404).json({ success: false, message: 'Project not found.' });
            }

            res.status(200).json({ success: true, project });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};
