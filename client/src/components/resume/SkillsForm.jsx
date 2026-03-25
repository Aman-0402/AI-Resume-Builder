import { useState } from 'react';
import api from '../../services/api';
import { suggestSkills } from '../../services/aiService';
import toast from 'react-hot-toast';
import { Plus, X, Loader, Sparkles } from 'lucide-react';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const CATEGORIES = ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'Tools', 'Languages', 'Other'];

const SkillsForm = ({ resume, onUpdate }) => {
  const [skills, setSkills] = useState(resume.skills || []);
  const [form, setForm] = useState({ name: '', level: 'Intermediate', category: 'Frontend' });
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);

  const handleAdd = async () => {
    if (!form.name.trim()) return toast.error('Skill name is required');
    setSaving(true);
    try {
      const { data } = await api.post(`/resumes/${resume.id}/skill`, form);
      const updated = [...skills, data.skill];
      setSkills(updated);
      onUpdate((prev) => ({ ...prev, skills: updated }));
      setForm({ name: '', level: 'Intermediate', category: form.category });
      toast.success('Skill added');
    } catch {
      toast.error('Failed to add skill');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eid) => {
    try {
      await api.delete(`/resumes/${resume.id}/skill/${eid}`);
      const updated = skills.filter((s) => s.id !== eid);
      setSkills(updated);
      onUpdate((prev) => ({ ...prev, skills: updated }));
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  const handleAISuggest = async () => {
    if (!jobTitle.trim()) return toast.error('Enter a job title first');
    setAiLoading(true);
    try {
      const existingNames = skills.map((s) => s.name).join(', ');
      const suggested = await suggestSkills({ jobTitle, existingSkills: existingNames });
      setSuggestions(suggested);
      toast.success(`${suggested.length} skills suggested!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI suggestion failed');
    } finally {
      setAiLoading(false);
    }
  };

  const addSuggested = async (skillName) => {
    setSaving(true);
    try {
      const { data } = await api.post(`/resumes/${resume.id}/skill`, {
        name: skillName,
        level: 'Intermediate',
        category: 'Other',
      });
      const updated = [...skills, data.skill];
      setSkills(updated);
      onUpdate((prev) => ({ ...prev, skills: updated }));
      setSuggestions((prev) => prev.filter((s) => s !== skillName));
    } catch {
      toast.error('Failed to add');
    } finally {
      setSaving(false);
    }
  };

  // Group skills by category
  const grouped = skills.reduce((acc, skill) => {
    const cat = skill.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <h2 className="text-white font-semibold text-sm">Skills</h2>

      {/* Manual add */}
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Skill Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="e.g. React.js  (press Enter to add)"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Level</label>
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleAdd} disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
          {saving ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />} Add Skill
        </button>
      </div>

      {/* AI suggest section */}
      <div className="border-t border-gray-700 pt-4">
        <button
          onClick={() => setShowSuggest(!showSuggest)}
          className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-xs font-medium mb-3"
        >
          <Sparkles size={13} /> AI Skill Suggestions
        </button>

        {showSuggest && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                placeholder="Your target job title..."
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAISuggest()}
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleAISuggest}
                disabled={aiLoading}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                {aiLoading ? <Loader size={13} className="animate-spin" /> : <Sparkles size={13} />}
                Suggest
              </button>
            </div>

            {suggestions.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Click to add:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => addSuggested(skill)}
                      className="flex items-center gap-1 bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600/40 text-indigo-300 text-xs px-3 py-1.5 rounded-full transition-colors"
                    >
                      <Plus size={11} /> {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Skills display */}
      {Object.keys(grouped).length > 0 && (
        <div className="space-y-3 border-t border-gray-700 pt-4">
          {Object.entries(grouped).map(([category, catSkills]) => (
            <div key={category}>
              <p className="text-gray-400 text-xs font-medium mb-2">{category}</p>
              <div className="flex flex-wrap gap-2">
                {catSkills.map((skill) => (
                  <span key={skill.id}
                    className="flex items-center gap-1.5 bg-gray-800 border border-gray-600 text-gray-300 text-xs px-3 py-1.5 rounded-full">
                    {skill.name}
                    <span className="text-gray-500">·</span>
                    <span className="text-indigo-400">{skill.level}</span>
                    <button onClick={() => handleDelete(skill.id)} className="text-gray-500 hover:text-red-400 ml-0.5">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {skills.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-4">No skills added yet</p>
      )}
    </div>
  );
};

export default SkillsForm;
