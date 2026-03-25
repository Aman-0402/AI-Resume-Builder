const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createResume, getResumes, getResumeById, updateResume, deleteResume,
  addExperience, updateExperience, deleteExperience,
  addEducation,  updateEducation,  deleteEducation,
  addSkill,      updateSkill,      deleteSkill,
  addProject,    updateProject,    deleteProject,
} = require('../controllers/resume.controller');

// All resume routes are protected
router.use(protect);

// Resume CRUD
router.post('/',       createResume);
router.get('/',        getResumes);
router.get('/:id',     getResumeById);
router.put('/:id',     updateResume);
router.delete('/:id',  deleteResume);

// Experience
router.post('/:id/experience',         addExperience);
router.put('/:id/experience/:eid',     updateExperience);
router.delete('/:id/experience/:eid',  deleteExperience);

// Education
router.post('/:id/education',         addEducation);
router.put('/:id/education/:eid',     updateEducation);
router.delete('/:id/education/:eid',  deleteEducation);

// Skills
router.post('/:id/skill',         addSkill);
router.put('/:id/skill/:eid',     updateSkill);
router.delete('/:id/skill/:eid',  deleteSkill);

// Projects
router.post('/:id/project',         addProject);
router.put('/:id/project/:eid',     updateProject);
router.delete('/:id/project/:eid',  deleteProject);

module.exports = router;
