const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  generateSummary,
  generateExperience,
  suggestSkills,
  generateProjectDescription,
  getAtsScore,
} = require('../controllers/ai.controller');

// All AI routes require login
router.use(protect);

router.post('/summary',     generateSummary);
router.post('/experience',  generateExperience);
router.post('/skills',      suggestSkills);
router.post('/project',     generateProjectDescription);
router.post('/ats-score',   getAtsScore);

module.exports = router;
