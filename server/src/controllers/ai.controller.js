const { ask } = require('../utils/gemini');

// ─────────────────────────────────────────
// POST /api/ai/summary
// Generate professional summary
// ─────────────────────────────────────────
const generateSummary = async (req, res) => {
  try {
    const { fullName, jobTitle, skills, yearsOfExperience, tone } = req.body;

    if (!fullName || !jobTitle) {
      return res.status(400).json({ message: 'fullName and jobTitle are required' });
    }

    const prompt = `
You are a professional resume writer.

Write a compelling professional summary for a resume. Return ONLY the summary paragraph, no extra text or labels.

Details:
- Name: ${fullName}
- Job Title / Target Role: ${jobTitle}
- Years of Experience: ${yearsOfExperience || 'fresher'}
- Key Skills: ${skills || 'not specified'}
- Tone: ${tone || 'professional'}

Requirements:
- 3-4 sentences maximum
- Start with the job title or years of experience
- Highlight key skills and value proposition
- No first-person pronouns (I, me, my)
- ATS-friendly keywords
- Professional and concise
`;

    const summary = await ask(prompt);
    res.json({ summary: summary.trim() });
  } catch (error) {
    console.error('AI summary error:', error.message);
    res.status(500).json({ message: 'AI generation failed. Check your GEMINI_API_KEY.' });
  }
};

// ─────────────────────────────────────────
// POST /api/ai/experience
// Generate bullet points for a job
// ─────────────────────────────────────────
const generateExperience = async (req, res) => {
  try {
    const { position, company, skills, industry } = req.body;

    if (!position || !company) {
      return res.status(400).json({ message: 'position and company are required' });
    }

    const prompt = `
You are a professional resume writer specializing in ATS-optimized resumes.

Generate 4-5 strong resume bullet points for this work experience. Return ONLY the bullet points, each on a new line starting with "•".

Details:
- Position: ${position}
- Company: ${company}
- Industry: ${industry || 'Technology'}
- Technologies/Skills used: ${skills || 'not specified'}

Requirements:
- Start each bullet with a strong action verb (Built, Developed, Improved, Led, Designed, etc.)
- Include quantifiable metrics where possible (%, numbers, timeframes)
- Focus on impact and achievements, not just duties
- ATS-friendly with relevant keywords
- Each bullet should be 1-2 lines max
`;

    const text = await ask(prompt);

    // Parse bullet points into an array
    const bullets = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('•') || l.startsWith('-') || l.startsWith('*'))
      .map((l) => l.replace(/^[•\-*]\s*/, '• '));

    res.json({ bullets, raw: text.trim() });
  } catch (error) {
    console.error('AI experience error:', error.message);
    res.status(500).json({ message: 'AI generation failed. Check your GEMINI_API_KEY.' });
  }
};

// ─────────────────────────────────────────
// POST /api/ai/skills
// Suggest relevant skills for a job title
// ─────────────────────────────────────────
const suggestSkills = async (req, res) => {
  try {
    const { jobTitle, existingSkills } = req.body;

    if (!jobTitle) {
      return res.status(400).json({ message: 'jobTitle is required' });
    }

    const prompt = `
You are a technical recruiter with deep knowledge of job market requirements.

Suggest the top 12 most relevant technical skills for this job title. Return ONLY a valid JSON array of strings, nothing else.

Job Title: ${jobTitle}
Already has: ${existingSkills || 'none'}

Format: ["Skill 1", "Skill 2", "Skill 3", ...]

Requirements:
- Mix of technical skills, tools, and technologies
- Most in-demand skills for this role in 2024
- Do NOT include skills already listed in "Already has"
- Return ONLY the JSON array, no explanation
`;

    const text = await ask(prompt);

    // Extract JSON array from response
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return res.status(500).json({ message: 'Failed to parse skill suggestions' });

    const skills = JSON.parse(match[0]);
    res.json({ skills });
  } catch (error) {
    console.error('AI skills error:', error.message);
    res.status(500).json({ message: 'AI generation failed. Check your GEMINI_API_KEY.' });
  }
};

// ─────────────────────────────────────────
// POST /api/ai/project
// Generate a project description
// ─────────────────────────────────────────
const generateProjectDescription = async (req, res) => {
  try {
    const { projectName, techStack, type } = req.body;

    if (!projectName) {
      return res.status(400).json({ message: 'projectName is required' });
    }

    const prompt = `
You are a professional resume writer.

Write a concise project description for a resume. Return ONLY the description, no labels or extra text.

Project Details:
- Name: ${projectName}
- Tech Stack: ${techStack || 'not specified'}
- Type: ${type || 'web application'}

Requirements:
- 2-3 sentences maximum
- Mention what it does, technologies used, and key features/impact
- Professional tone, no first-person pronouns
- Include relevant technical keywords for ATS
`;

    const description = await ask(prompt);
    res.json({ description: description.trim() });
  } catch (error) {
    console.error('AI project error:', error.message);
    res.status(500).json({ message: 'AI generation failed. Check your GEMINI_API_KEY.' });
  }
};

// ─────────────────────────────────────────
// POST /api/ai/ats-score
// Analyze resume and return ATS score
// ─────────────────────────────────────────
const getAtsScore = async (req, res) => {
  try {
    const { resume, jobDescription } = req.body;

    if (!resume) {
      return res.status(400).json({ message: 'resume data is required' });
    }

    const resumeText = `
Name: ${resume.fullName}
Summary: ${resume.summary || 'none'}
Skills: ${(resume.skills || []).map((s) => s.name).join(', ')}
Experience: ${(resume.experiences || []).map((e) => `${e.position} at ${e.company}: ${e.description || ''}`).join(' | ')}
Education: ${(resume.educations || []).map((e) => `${e.degree} in ${e.field} from ${e.institution}`).join(' | ')}
Projects: ${(resume.projects || []).map((p) => `${p.name}: ${p.description || ''}`).join(' | ')}
`;

    const prompt = `
You are an ATS (Applicant Tracking System) expert.

Analyze this resume and return a JSON object with the ATS score and feedback. Return ONLY valid JSON, nothing else.

Resume:
${resumeText}

${jobDescription ? `Target Job Description:\n${jobDescription}` : ''}

Return this exact JSON structure:
{
  "score": <number 0-100>,
  "grade": "<A+/A/B+/B/C/D>",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "missingKeywords": ["keyword 1", "keyword 2"],
  "tips": ["tip 1", "tip 2"]
}
`;

    const text = await ask(prompt);
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ message: 'Failed to parse ATS analysis' });

    const result = JSON.parse(match[0]);
    res.json(result);
  } catch (error) {
    console.error('ATS score error:', error.message);
    res.status(500).json({ message: 'AI generation failed. Check your GEMINI_API_KEY.' });
  }
};

module.exports = {
  generateSummary,
  generateExperience,
  suggestSkills,
  generateProjectDescription,
  getAtsScore,
};
