import { useState } from 'react';
import api from '../../services/api';
import { generateProjectDescription } from '../../services/aiService';
import toast from 'react-hot-toast';
import { Plus, Trash2, Loader, ExternalLink, GitBranch, Sparkles } from 'lucide-react';

const EMPTY = { name: '', description: '', techStack: '', liveUrl: '', githubUrl: '' };

const ProjectsForm = ({ resume, onUpdate }) => {
  const [projects, setProjects] = useState(resume.projects || []);
  const [form, setForm] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGenerateDescription = async () => {
    if (!form.name.trim()) return toast.error('Enter project name first');
    setAiLoading(true);
    try {
      const description = await generateProjectDescription({
        projectName: form.name,
        techStack: form.techStack,
      });
      setForm((prev) => ({ ...prev, description }));
      toast.success('Description generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return toast.error('Project name is required');
    setSaving(true);
    try {
      const { data } = await api.post(`/resumes/${resume.id}/project`, form);
      const updated = [...projects, data.project];
      setProjects(updated);
      onUpdate((prev) => ({ ...prev, projects: updated }));
      setForm(EMPTY);
      setAdding(false);
      toast.success('Project added');
    } catch {
      toast.error('Failed to add project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eid) => {
    try {
      await api.delete(`/resumes/${resume.id}/project/${eid}`);
      const updated = projects.filter((p) => p.id !== eid);
      setProjects(updated);
      onUpdate((prev) => ({ ...prev, projects: updated }));
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm">Projects</h2>
        <button onClick={() => { setAdding(!adding); setForm(EMPTY); }}
          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs font-medium">
          <Plus size={14} /> Add
        </button>
      </div>

      {projects.map((proj) => (
        <div key={proj.id} className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">{proj.name}</p>
              {proj.techStack && <p className="text-indigo-400 text-xs mt-0.5">{proj.techStack}</p>}
              {proj.description && <p className="text-gray-400 text-xs mt-1 line-clamp-2">{proj.description}</p>}
              <div className="flex gap-3 mt-2">
                {proj.liveUrl && (
                  <span className="flex items-center gap-1 text-gray-500 text-xs">
                    <ExternalLink size={11} /> Live
                  </span>
                )}
                {proj.githubUrl && (
                  <span className="flex items-center gap-1 text-gray-500 text-xs">
                    <GitBranch size={11} /> GitHub
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => handleDelete(proj.id)} className="text-gray-500 hover:text-red-400 transition-colors ml-3">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      {adding && (
        <div className="bg-gray-800 border border-indigo-500/50 rounded-lg p-4 space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Project Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="AI Resume Builder"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tech Stack</label>
            <input name="techStack" value={form.techStack} onChange={handleChange} placeholder="React, Node.js, PostgreSQL"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400">Description</label>
              <button
                onClick={handleGenerateDescription}
                disabled={aiLoading}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-50"
              >
                {aiLoading ? <Loader size={11} className="animate-spin" /> : <Sparkles size={11} />}
                AI Generate
              </button>
            </div>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="Describe the project or click 'AI Generate'..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Live URL</label>
              <input name="liveUrl" value={form.liveUrl} onChange={handleChange} placeholder="https://myapp.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">GitHub URL</label>
              <input name="githubUrl" value={form.githubUrl} onChange={handleChange} placeholder="github.com/aman/app"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg">
              {saving ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />} Add Project
            </button>
            <button onClick={() => setAdding(false)}
              className="px-4 text-gray-400 hover:text-white text-sm border border-gray-600 rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      )}

      {projects.length === 0 && !adding && (
        <p className="text-gray-500 text-sm text-center py-6">No projects added yet</p>
      )}
    </div>
  );
};

export default ProjectsForm;
