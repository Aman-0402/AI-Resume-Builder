import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Save, Loader } from 'lucide-react';

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

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Professional Summary</label>
        <textarea
          name="summary"
          value={form.summary}
          onChange={handleChange}
          rows={4}
          placeholder="Write a short summary about yourself..."
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
