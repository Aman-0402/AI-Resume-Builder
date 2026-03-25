import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import api from '../services/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import PersonalInfoForm from '../components/resume/PersonalInfoForm';
import ExperienceForm from '../components/resume/ExperienceForm';
import EducationForm from '../components/resume/EducationForm';
import SkillsForm from '../components/resume/SkillsForm';
import ProjectsForm from '../components/resume/ProjectsForm';
import AtsChecker from '../components/resume/AtsChecker';
import ResumePreview from '../components/resume/ResumePreview';
import ResumePrint from '../components/resume/ResumePrint';
import { Loader, User, Briefcase, GraduationCap, Code, FolderOpen, Download, Target } from 'lucide-react';

const TABS = [
  { id: 'personal',    label: 'Personal',    icon: User },
  { id: 'experience',  label: 'Experience',  icon: Briefcase },
  { id: 'education',   label: 'Education',   icon: GraduationCap },
  { id: 'skills',      label: 'Skills',      icon: Code },
  { id: 'projects',    label: 'Projects',    icon: FolderOpen },
  { id: 'ats',         label: 'ATS',         icon: Target },
];

const ResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [printing, setPrinting] = useState(false);

  // ref points at the <ResumePrint> DOM node
  const printRef = useRef(null);

  // react-to-print hook
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: resume ? `${resume.fullName} - Resume` : 'Resume',
    onBeforePrint: () => {
      setPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setPrinting(false);
      toast.success('PDF downloaded!');
    },
  });

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      const { data } = await api.get(`/resumes/${id}`);
      setResume(data.resume);
    } catch {
      toast.error('Failed to load resume');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader size={36} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* Hidden print component — mounted but invisible */}
      <div style={{ display: 'none' }} id="resume-print-area">
        <ResumePrint ref={printRef} resume={resume} />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">{resume.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-gray-400 text-sm">{resume.fullName}</p>
              {resume.atsScore != null && (
                <span
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    resume.atsScore >= 80 ? 'bg-green-900/40 text-green-400 border-green-700/50' :
                    resume.atsScore >= 60 ? 'bg-yellow-900/40 text-yellow-400 border-yellow-700/50' :
                    'bg-red-900/40 text-red-400 border-red-700/50'
                  }`}
                >
                  <Target size={10} />
                  ATS {resume.atsScore}/100
                </span>
              )}
            </div>
          </div>

          {/* Download PDF button */}
          <button
            onClick={handlePrint}
            disabled={printing}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-green-900/30"
          >
            {printing
              ? <><Loader size={16} className="animate-spin" /> Preparing...</>
              : <><Download size={16} /> Download PDF</>
            }
          </button>
        </div>

        <div className="flex gap-6">
          {/* Left: Form panel */}
          <div className="w-full lg:w-[45%] flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-900 border border-gray-700 rounded-xl p-1">
              {TABS.map(({ id: tabId, label, icon: Icon }) => (
                <button
                  key={tabId}
                  onClick={() => setActiveTab(tabId)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tabId
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon size={13} />
                  <span className="hidden sm:block">{label}</span>
                </button>
              ))}
            </div>

            {/* Active form */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
              {activeTab === 'personal'   && <PersonalInfoForm resume={resume} onUpdate={setResume} />}
              {activeTab === 'experience' && <ExperienceForm resume={resume} onUpdate={setResume} />}
              {activeTab === 'education'  && <EducationForm resume={resume} onUpdate={setResume} />}
              {activeTab === 'skills'     && <SkillsForm resume={resume} onUpdate={setResume} />}
              {activeTab === 'projects'   && <ProjectsForm resume={resume} onUpdate={setResume} />}
              {activeTab === 'ats'        && <AtsChecker resume={resume} onUpdate={setResume} />}
            </div>
          </div>

          {/* Right: Live preview */}
          <div className="hidden lg:block flex-1">
            <div className="sticky top-6 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
              {/* Preview bar with download button */}
              <div className="bg-gray-800 border-b border-gray-700 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-gray-400 text-xs ml-2">Live Preview</span>
                </div>
                <button
                  onClick={handlePrint}
                  disabled={printing}
                  className="flex items-center gap-1.5 bg-green-600/20 hover:bg-green-600/40 border border-green-600/30 text-green-400 text-xs font-medium px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Download size={12} />
                  {printing ? 'Preparing...' : 'Download PDF'}
                </button>
              </div>
              <div className="overflow-y-auto max-h-[80vh] p-4">
                <ResumePreview resume={resume} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
