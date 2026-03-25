import { useState } from 'react';
import api from '../../services/api';
import { generateSummary } from '../../services/aiService';
import toast from 'react-hot-toast';
import { Save, Loader, Sparkles } from 'lucide-react';

const Field = ({ label, name, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label className="text-xs text-gray-400 mb-1 block">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
    />
  </div>
);

const PersonalInfoForm = ({ resume, onUpdate }) => {
  const [form, setForm] = useState({
    title:    resume.title    || '',
    fullName: resume.fullName || '',
    email:    resume.email    || '',
    phone:    resume.phone    || '',
    location: resume.location || '',
    linkedin: resume.linkedin || '',
    github:   resume.github   || '',
    website:  resume.website  || '',
    summary:  resume.summary  || '',
  });
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // AI prompt state
  const [aiForm, setAiForm] = useState({ jobTitle: '', yearsOfExperience: '', tone: 'professional' });
  const [showAiPanel, setShowAiPanel] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/resumes/${resume.id}`, form);
      onUpdate((prev) => ({ ...prev, ...data.resume }));
      toast.success('Saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!aiForm.jobTitle) return toast.error('Enter a job title first');
    setAiLoading(true);
    try {
      const existingSkills = (resume.skills || []).map((s) => s.name).join(', ');
      const summary = await generateSummary({
        fullName: form.fullName,
        jobTitle: aiForm.jobTitle,
        yearsOfExperience: aiForm.yearsOfExperience,
        skills: existingSkills,
        tone: aiForm.tone,
      });
      setForm((prev) => ({ ...prev, summary }));
      setShowAiPanel(false);
      toast.success('Summary generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-white font-semibold text-sm mb-4">Personal Information</h2>

      <Field label="Resume Title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Software Engineer Resume" />
      <Field label="Full Name *"  name="fullName" value={form.fullName} onChange={handleChange} placeholder="Aman Gupta" />
      <Field label="Email *"      name="email"    value={form.email}    onChange={handleChange} type="email" placeholder="aman@example.com" />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone"    name="phone"    value={form.phone}    onChange={handleChange} placeholder="+91 9876543210" />
        <Field label="Location" name="location" value={form.location} onChange={handleChange} placeholder="Pune, India" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="LinkedIn" name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="linkedin.com/in/aman" />
        <Field label="GitHub"   name="github"   value={form.github}   onChange={handleChange} placeholder="github.com/aman" />
      </div>

      <Field label="Website / Portfolio" name="website" value={form.website} onChange={handleChange} placeholder="aman.dev" />

      {/* Summary with AI button */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-400">Professional Summary</label>
          <button
            onClick={() => setShowAiPanel(!showAiPanel)}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            <Sparkles size={12} />
            Generate with AI
          </button>
        </div>

        {/* AI generation panel */}
        {showAiPanel && (
          <div className="bg-indigo-950/50 border border-indigo-500/30 rounded-lg p-3 mb-2 space-y-2">
            <p className="text-xs text-indigo-300 font-medium flex items-center gap-1">
              <Sparkles size={11} /> AI Summary Generator
            </p>
            <input
              placeholder="Target job title (e.g. Full Stack Developer) *"
              value={aiForm.jobTitle}
              onChange={(e) => setAiForm({ ...aiForm, jobTitle: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Years of experience"
                value={aiForm.yearsOfExperience}
                onChange={(e) => setAiForm({ ...aiForm, yearsOfExperience: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={aiForm.tone}
                onChange={(e) => setAiForm({ ...aiForm, tone: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="professional">Professional</option>
                <option value="creative">Creative</option>
                <option value="confident">Confident</option>
                <option value="concise">Concise</option>
              </select>
            </div>
            <button
              onClick={handleGenerateSummary}
              disabled={aiLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
            >
              {aiLoading
                ? <><Loader size={14} className="animate-spin" /> Generating...</>
                : <><Sparkles size={14} /> Generate Summary</>}
            </button>
          </div>
        )}

        <textarea
          name="summary"
          value={form.summary}
          onChange={handleChange}
          rows={4}
          placeholder="Write a short summary or click 'Generate with AI'..."
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
      >
        {saving ? <><Loader size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Changes</>}
      </button>
    </div>
  );
};

export default PersonalInfoForm;
