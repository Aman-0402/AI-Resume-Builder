import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { Plus, FileText, Trash2, Edit, Clock, Loader } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const { data } = await api.get('/resumes');
      setResumes(data.resumes);
    } catch {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const createResume = async () => {
    setCreating(true);
    try {
      const { data } = await api.post('/resumes', {
        title: 'My Resume',
        fullName: user.name,
        email: user.email,
      });
      toast.success('Resume created!');
      navigate(`/resume/${data.resume.id}`);
    } catch {
      toast.error('Failed to create resume');
    } finally {
      setCreating(false);
    }
  };

  const deleteResume = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this resume?')) return;
    try {
      await api.delete(`/resumes/${id}`);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      toast.success('Resume deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Resumes</h1>
            <p className="text-gray-400 text-sm mt-1">
              {resumes.length} resume{resumes.length !== 1 ? 's' : ''} created
            </p>
          </div>
          <button
            onClick={createResume}
            disabled={creating}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            {creating ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
            New Resume
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader size={32} className="animate-spin text-indigo-400" />
          </div>
        )}

        {/* Empty state */}
        {!loading && resumes.length === 0 && (
          <div className="text-center py-20">
            <FileText size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">No resumes yet</h3>
            <p className="text-gray-400 text-sm mb-6">Create your first AI-powered resume</p>
            <button
              onClick={createResume}
              disabled={creating}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors mx-auto"
            >
              <Plus size={16} />
              Create Resume
            </button>
          </div>
        )}

        {/* Resume grid */}
        {!loading && resumes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                onClick={() => navigate(`/resume/${resume.id}`)}
                className="bg-gray-900 border border-gray-700 hover:border-indigo-500 rounded-xl p-5 cursor-pointer transition-all group"
              >
                {/* Icon + Title */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-600/20 rounded-lg p-2">
                      <FileText size={20} className="text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm truncate max-w-[140px]">
                        {resume.title}
                      </h3>
                      <p className="text-gray-500 text-xs">{resume.fullName}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => deleteResume(resume.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Template badge */}
                <span className="inline-block bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full capitalize mb-4">
                  {resume.templateId} template
                </span>

                {/* Date */}
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <Clock size={12} />
                  Updated {formatDate(resume.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
