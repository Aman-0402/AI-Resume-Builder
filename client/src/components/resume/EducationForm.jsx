import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Loader } from 'lucide-react';

const EMPTY = { institution: '', degree: '', field: '', startDate: '', endDate: '', grade: '' };

const EducationForm = ({ resume, onUpdate }) => {
  const [educations, setEducations] = useState(resume.educations || []);
  const [form, setForm] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async () => {
    if (!form.institution || !form.degree || !form.field || !form.startDate)
      return toast.error('Institution, degree, field and start date are required');
    setSaving(true);
    try {
      const { data } = await api.post(`/resumes/${resume.id}/education`, form);
      const updated = [...educations, data.education];
      setEducations(updated);
      onUpdate((prev) => ({ ...prev, educations: updated }));
      setForm(EMPTY);
      setAdding(false);
      toast.success('Education added');
    } catch {
      toast.error('Failed to add');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eid) => {
    try {
      await api.delete(`/resumes/${resume.id}/education/${eid}`);
      const updated = educations.filter((e) => e.id !== eid);
      setEducations(updated);
      onUpdate((prev) => ({ ...prev, educations: updated }));
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm">Education</h2>
        <button onClick={() => { setAdding(!adding); setForm(EMPTY); }}
          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs font-medium">
          <Plus size={14} /> Add
        </button>
      </div>

      {educations.map((edu) => (
        <div key={edu.id} className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 flex items-start justify-between">
          <div>
            <p className="text-white text-sm font-medium">{edu.degree} in {edu.field}</p>
            <p className="text-gray-400 text-xs">{edu.institution}</p>
            <p className="text-gray-500 text-xs">{edu.startDate} – {edu.endDate || 'Present'} {edu.grade ? `· ${edu.grade}` : ''}</p>
          </div>
          <button onClick={() => handleDelete(edu.id)} className="text-gray-500 hover:text-red-400 transition-colors mt-0.5">
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {adding && (
        <div className="bg-gray-800 border border-indigo-500/50 rounded-lg p-4 space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Institution *</label>
            <input name="institution" value={form.institution} onChange={handleChange} placeholder="MIT"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Degree *</label>
              <input name="degree" value={form.degree} onChange={handleChange} placeholder="Bachelor of Science"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Field *</label>
              <input name="field" value={form.field} onChange={handleChange} placeholder="Computer Science"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Start Date *</label>
              <input name="startDate" value={form.startDate} onChange={handleChange} placeholder="Aug 2020"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">End Date</label>
              <input name="endDate" value={form.endDate} onChange={handleChange} placeholder="May 2024"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Grade / GPA</label>
            <input name="grade" value={form.grade} onChange={handleChange} placeholder="8.5 CGPA"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg">
              {saving ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />} Add Education
            </button>
            <button onClick={() => setAdding(false)}
              className="px-4 text-gray-400 hover:text-white text-sm border border-gray-600 rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      )}

      {educations.length === 0 && !adding && (
        <p className="text-gray-500 text-sm text-center py-6">No education added yet</p>
      )}
    </div>
  );
};

export default EducationForm;
