import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, X, Loader } from 'lucide-react';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const CATEGORIES = ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'Tools', 'Languages', 'Other'];

const SkillsForm = ({ resume, onUpdate }) => {
  const [skills, setSkills] = useState(resume.skills || []);
  const [form, setForm] = useState({ name: '', level: 'Intermediate', category: 'Frontend' });
  const [saving, setSaving] = useState(false);

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

      {/* Add skill */}
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Skill Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="e.g. React.js"
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

      {/* Skills display */}
      {Object.keys(grouped).length > 0 && (
        <div className="space-y-3 mt-2">
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
        <p className="text-gray-500 text-sm text-center py-4">No skills added yet. Press Enter to add quickly.</p>
      )}
    </div>
  );
};

export default SkillsForm;
