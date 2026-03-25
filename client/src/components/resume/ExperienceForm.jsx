import { useState } from 'react';
import api from '../../services/api';
import { generateExperienceBullets } from '../../services/aiService';
import toast from 'react-hot-toast';
import { Plus, Trash2, ChevronDown, ChevronUp, Loader, Sparkles } from 'lucide-react';

const EMPTY = { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' };

const ExperienceForm = ({ resume, onUpdate }) => {
  const [experiences, setExperiences] = useState(resume.experiences || []);
  const [form, setForm] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleGenerateBullets = async () => {
    if (!form.position || !form.company) return toast.error('Enter position and company first');
    setAiLoading(true);
    try {
      const { raw } = await generateExperienceBullets({
        position: form.position,
        company: form.company,
        skills: resume.skills?.map((s) => s.name).join(', '),
      });
      setForm((prev) => ({ ...prev, description: raw.trim() }));
      toast.success('Bullets generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.company || !form.position || !form.startDate)
      return toast.error('Company, position and start date are required');
    setSaving(true);
    try {
      const { data } = await api.post(`/resumes/${resume.id}/experience`, form);
      const updated = [...experiences, data.experience];
      setExperiences(updated);
      onUpdate((prev) => ({ ...prev, experiences: updated }));
      setForm(EMPTY);
      setAdding(false);
      toast.success('Experience added');
    } catch {
      toast.error('Failed to add experience');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eid) => {
    try {
      await api.delete(`/resumes/${resume.id}/experience/${eid}`);
      const updated = experiences.filter((e) => e.id !== eid);
      setExperiences(updated);
      onUpdate((prev) => ({ ...prev, experiences: updated }));
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm">Work Experience</h2>
        <button
          onClick={() => { setAdding(!adding); setForm(EMPTY); }}
          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs font-medium"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {experiences.map((exp) => (
        <div key={exp.id} className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer"
            onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}
          >
            <div>
              <p className="text-white text-sm font-medium">{exp.position}</p>
              <p className="text-gray-400 text-xs">{exp.company} · {exp.startDate} – {exp.current ? 'Present' : exp.endDate}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); handleDelete(exp.id); }}
                className="text-gray-500 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
              {expandedId === exp.id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </div>
          </div>
          {expandedId === exp.id && exp.description && (
            <div className="px-4 pb-3 text-gray-400 text-xs border-t border-gray-700 pt-3 whitespace-pre-line">
              {exp.description}
            </div>
          )}
        </div>
      ))}

      {adding && (
        <div className="bg-gray-800 border border-indigo-500/50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[['Company *', 'company', 'Google'], ['Position *', 'position', 'Software Engineer']].map(([label, name, ph]) => (
              <div key={name}>
                <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                <input name={name} value={form[name]} onChange={handleChange} placeholder={ph}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Location</label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="Bangalore, India"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Start Date *</label>
              <input name="startDate" value={form.startDate} onChange={handleChange} placeholder="Jan 2022"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">End Date</label>
              <input name="endDate" value={form.endDate} onChange={handleChange} disabled={form.current} placeholder="Dec 2023"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 disabled:opacity-40" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer">
            <input type="checkbox" name="current" checked={form.current} onChange={handleChange} className="accent-indigo-600" />
            Currently working here
          </label>

          {/* Description with AI button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400">Description</label>
              <button
                onClick={handleGenerateBullets}
                disabled={aiLoading}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-50"
              >
                {aiLoading ? <Loader size={11} className="animate-spin" /> : <Sparkles size={11} />}
                AI Generate
              </button>
            </div>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4}
              placeholder="• Click 'AI Generate' to auto-fill bullet points&#10;• Or write your own achievements"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none" />
          </div>

          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
              {saving ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />} Add Experience
            </button>
            <button onClick={() => setAdding(false)}
              className="px-4 text-gray-400 hover:text-white text-sm border border-gray-600 rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {experiences.length === 0 && !adding && (
        <p className="text-gray-500 text-sm text-center py-6">No experience added yet</p>
      )}
    </div>
  );
};

export default ExperienceForm;
