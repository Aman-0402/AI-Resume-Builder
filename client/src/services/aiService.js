import api from './api';

export const generateSummary = (data) =>
  api.post('/ai/summary', data).then((r) => r.data.summary);

export const generateExperienceBullets = (data) =>
  api.post('/ai/experience', data).then((r) => r.data);

export const suggestSkills = (data) =>
  api.post('/ai/skills', data).then((r) => r.data.skills);

export const generateProjectDescription = (data) =>
  api.post('/ai/project', data).then((r) => r.data.description);

export const getAtsScore = (data) =>
  api.post('/ai/ats-score', data).then((r) => r.data);
