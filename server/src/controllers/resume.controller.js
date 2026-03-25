const prisma = require('../utils/prisma');

// ─────────────────────────────────────────
// POST /api/resumes — Create a new resume
// ─────────────────────────────────────────
const createResume = async (req, res) => {
  try {
    const { title, fullName, email, phone, location, linkedin, github, website, templateId } = req.body;

    if (!title || !fullName || !email) {
      return res.status(400).json({ message: 'Title, full name and email are required' });
    }

    const resume = await prisma.resume.create({
      data: {
        userId: req.userId,
        title,
        fullName,
        email,
        phone,
        location,
        linkedin,
        github,
        website,
        templateId: templateId || 'modern',
      },
    });

    res.status(201).json({ message: 'Resume created', resume });
  } catch (error) {
    console.error('Create resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// GET /api/resumes — Get all resumes for logged-in user
// ─────────────────────────────────────────
const getResumes = async (req, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' },
      // Only return summary info for the list view (not full sections)
      select: {
        id: true,
        title: true,
        fullName: true,
        email: true,
        templateId: true,
        atsScore: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ resumes });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// GET /api/resumes/:id — Get one full resume with all sections
// ─────────────────────────────────────────
const getResumeById = async (req, res) => {
  try {
    const resume = await prisma.resume.findUnique({
      where: { id: req.params.id },
      include: {
        experiences: { orderBy: { orderIndex: 'asc' } },
        educations:  { orderBy: { orderIndex: 'asc' } },
        skills:      { orderBy: { orderIndex: 'asc' } },
        projects:    { orderBy: { orderIndex: 'asc' } },
      },
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Ensure the resume belongs to the logged-in user
    if (resume.userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to view this resume' });
    }

    res.json({ resume });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// PUT /api/resumes/:id — Update resume header/summary
// ─────────────────────────────────────────
const updateResume = async (req, res) => {
  try {
    const existing = await prisma.resume.findUnique({ where: { id: req.params.id } });

    if (!existing) return res.status(404).json({ message: 'Resume not found' });
    if (existing.userId !== req.userId) return res.status(403).json({ message: 'Not authorized' });

    const { title, fullName, email, phone, location, linkedin, github, website, summary, templateId, atsScore } = req.body;

    const resume = await prisma.resume.update({
      where: { id: req.params.id },
      data: {
        ...(title      && { title }),
        ...(fullName   && { fullName }),
        ...(email      && { email }),
        ...(phone      !== undefined && { phone }),
        ...(location   !== undefined && { location }),
        ...(linkedin   !== undefined && { linkedin }),
        ...(github     !== undefined && { github }),
        ...(website    !== undefined && { website }),
        ...(summary    !== undefined && { summary }),
        ...(templateId && { templateId }),
        ...(atsScore   !== undefined && { atsScore }),
      },
    });

    res.json({ message: 'Resume updated', resume });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// DELETE /api/resumes/:id — Delete resume (cascades to all sections)
// ─────────────────────────────────────────
const deleteResume = async (req, res) => {
  try {
    const existing = await prisma.resume.findUnique({ where: { id: req.params.id } });

    if (!existing) return res.status(404).json({ message: 'Resume not found' });
    if (existing.userId !== req.userId) return res.status(403).json({ message: 'Not authorized' });

    await prisma.resume.delete({ where: { id: req.params.id } });

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ═══════════════════════════════════════════
// EXPERIENCE SECTION
// ═══════════════════════════════════════════

const addExperience = async (req, res) => {
  try {
    const { company, position, location, startDate, endDate, current, description, orderIndex } = req.body;

    if (!company || !position || !startDate) {
      return res.status(400).json({ message: 'Company, position and start date are required' });
    }

    const experience = await prisma.experience.create({
      data: {
        resumeId: req.params.id,
        company, position, location, startDate,
        endDate: current ? null : endDate,
        current: current || false,
        description,
        orderIndex: orderIndex || 0,
      },
    });

    res.status(201).json({ message: 'Experience added', experience });
  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateExperience = async (req, res) => {
  try {
    const experience = await prisma.experience.update({
      where: { id: req.params.eid },
      data: req.body,
    });
    res.json({ message: 'Experience updated', experience });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteExperience = async (req, res) => {
  try {
    await prisma.experience.delete({ where: { id: req.params.eid } });
    res.json({ message: 'Experience deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ═══════════════════════════════════════════
// EDUCATION SECTION
// ═══════════════════════════════════════════

const addEducation = async (req, res) => {
  try {
    const { institution, degree, field, startDate, endDate, grade, orderIndex } = req.body;

    if (!institution || !degree || !field || !startDate) {
      return res.status(400).json({ message: 'Institution, degree, field and start date are required' });
    }

    const education = await prisma.education.create({
      data: { resumeId: req.params.id, institution, degree, field, startDate, endDate, grade, orderIndex: orderIndex || 0 },
    });

    res.status(201).json({ message: 'Education added', education });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateEducation = async (req, res) => {
  try {
    const education = await prisma.education.update({ where: { id: req.params.eid }, data: req.body });
    res.json({ message: 'Education updated', education });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteEducation = async (req, res) => {
  try {
    await prisma.education.delete({ where: { id: req.params.eid } });
    res.json({ message: 'Education deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ═══════════════════════════════════════════
// SKILLS SECTION
// ═══════════════════════════════════════════

const addSkill = async (req, res) => {
  try {
    const { name, level, category, orderIndex } = req.body;
    if (!name) return res.status(400).json({ message: 'Skill name is required' });

    const skill = await prisma.skill.create({
      data: { resumeId: req.params.id, name, level, category, orderIndex: orderIndex || 0 },
    });

    res.status(201).json({ message: 'Skill added', skill });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSkill = async (req, res) => {
  try {
    const skill = await prisma.skill.update({ where: { id: req.params.eid }, data: req.body });
    res.json({ message: 'Skill updated', skill });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteSkill = async (req, res) => {
  try {
    await prisma.skill.delete({ where: { id: req.params.eid } });
    res.json({ message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ═══════════════════════════════════════════
// PROJECTS SECTION
// ═══════════════════════════════════════════

const addProject = async (req, res) => {
  try {
    const { name, description, techStack, liveUrl, githubUrl, orderIndex } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const project = await prisma.project.create({
      data: { resumeId: req.params.id, name, description, techStack, liveUrl, githubUrl, orderIndex: orderIndex || 0 },
    });

    res.status(201).json({ message: 'Project added', project });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await prisma.project.update({ where: { id: req.params.eid }, data: req.body });
    res.json({ message: 'Project updated', project });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteProject = async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.eid } });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createResume, getResumes, getResumeById, updateResume, deleteResume,
  addExperience, updateExperience, deleteExperience,
  addEducation,  updateEducation,  deleteEducation,
  addSkill,      updateSkill,      deleteSkill,
  addProject,    updateProject,    deleteProject,
};
