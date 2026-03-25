import { useState } from 'react';
import api from '../../services/api';
import { getAtsScore } from '../../services/aiService';
import toast from 'react-hot-toast';
import {
  Loader, Sparkles, CheckCircle, AlertCircle, XCircle,
  TrendingUp, Target, Lightbulb, Tag,
} from 'lucide-react';

// ── Score ring SVG ──
const ScoreRing = ({ score }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  const color =
    score >= 80 ? '#22c55e' :
    score >= 60 ? '#f59e0b' :
    score >= 40 ? '#f97316' : '#ef4444';

  const grade =
    score >= 90 ? 'A+' :
    score >= 80 ? 'A'  :
    score >= 70 ? 'B+' :
    score >= 60 ? 'B'  :
    score >= 50 ? 'C'  : 'D';

  return (
    <div className="flex flex-col items-center">
      <svg width="130" height="130" className="-rotate-90">
        {/* Background track */}
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#1f2937" strokeWidth="10" />
        {/* Score arc */}
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      {/* Center text — rotated back */}
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white" style={{ color }}>{score}</span>
        <span className="text-xs text-gray-400">/ 100</span>
        <span className="text-lg font-bold mt-0.5" style={{ color }}>{grade}</span>
      </div>
    </div>
  );
};

// ── Color badge ──
const Badge = ({ text, color }) => {
  const colors = {
    green:  'bg-green-900/40 text-green-400 border-green-700/50',
    red:    'bg-red-900/40 text-red-400 border-red-700/50',
    yellow: 'bg-yellow-900/40 text-yellow-400 border-yellow-700/50',
    blue:   'bg-blue-900/40 text-blue-400 border-blue-700/50',
  };
  return (
    <span className={`inline-flex items-center border text-xs px-2.5 py-1 rounded-full ${colors[color]}`}>
      {text}
    </span>
  );
};

const AtsChecker = ({ resume, onUpdate }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!resume.fullName) return toast.error('Complete your resume first');
    setLoading(true);
    setResult(null);
    try {
      const data = await getAtsScore({ resume, jobDescription });
      setResult(data);

      // Save the ATS score to DB
      await api.put(`/resumes/${resume.id}`, { atsScore: data.score });
      onUpdate((prev) => ({ ...prev, atsScore: data.score }));

      toast.success('ATS analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'ATS check failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Target size={16} className="text-indigo-400" />
        <h2 className="text-white font-semibold text-sm">ATS Score Checker</h2>
      </div>

      <p className="text-gray-400 text-xs leading-relaxed">
        ATS (Applicant Tracking Systems) scan resumes before a human ever reads them.
        Paste a job description below for targeted analysis, or leave it blank for a general score.
      </p>

      {/* Job description input */}
      <div>
        <label className="text-xs text-gray-400 mb-1 block">
          Job Description <span className="text-gray-600">(optional — for targeted analysis)</span>
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={5}
          placeholder="Paste the job description here for a more accurate ATS score and keyword matching..."
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
        />
      </div>

      <button
        onClick={handleCheck}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
      >
        {loading
          ? <><Loader size={15} className="animate-spin" /> Analyzing resume...</>
          : <><Sparkles size={15} /> Check ATS Score</>
        }
      </button>

      {/* ── RESULTS ── */}
      {result && (
        <div className="space-y-4 mt-2">

          {/* Score ring + summary */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center gap-6">
              <div className="relative flex items-center justify-center w-[130px] h-[130px] shrink-0">
                <ScoreRing score={result.score} />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg mb-1">
                  {result.score >= 80 ? 'Excellent Resume!'  :
                   result.score >= 60 ? 'Good Resume'        :
                   result.score >= 40 ? 'Needs Improvement'  : 'Significant Work Needed'}
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {result.score >= 80
                    ? 'Your resume is well-optimized for ATS systems and should pass most filters.'
                    : result.score >= 60
                    ? 'Your resume is decent but has room for improvement to beat ATS filters.'
                    : 'Your resume may get filtered out by ATS. Follow the tips below to improve.'}
                </p>
                {resume.atsScore && (
                  <p className="text-indigo-400 text-xs mt-2">Score saved to resume</p>
                )}
              </div>
            </div>
          </div>

          {/* Strengths */}
          {result.strengths?.length > 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={14} className="text-green-400" />
                <h3 className="text-green-400 font-semibold text-xs uppercase tracking-wider">Strengths</h3>
              </div>
              <ul className="space-y-1.5">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-xs">
                    <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {result.improvements?.length > 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={14} className="text-yellow-400" />
                <h3 className="text-yellow-400 font-semibold text-xs uppercase tracking-wider">Areas to Improve</h3>
              </div>
              <ul className="space-y-1.5">
                {result.improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-xs">
                    <span className="text-yellow-400 mt-0.5 shrink-0">!</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing keywords */}
          {result.missingKeywords?.length > 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={14} className="text-red-400" />
                <h3 className="text-red-400 font-semibold text-xs uppercase tracking-wider">Missing Keywords</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((kw, i) => (
                  <Badge key={i} text={kw} color="red" />
                ))}
              </div>
            </div>
          )}

          {/* Pro tips */}
          {result.tips?.length > 0 && (
            <div className="bg-indigo-950/40 border border-indigo-700/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={14} className="text-indigo-400" />
                <h3 className="text-indigo-400 font-semibold text-xs uppercase tracking-wider">Pro Tips</h3>
              </div>
              <ul className="space-y-1.5">
                {result.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-xs">
                    <span className="text-indigo-400 mt-0.5 shrink-0">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Re-check button */}
          <button
            onClick={handleCheck}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 border border-gray-600 hover:border-indigo-500 text-gray-400 hover:text-white text-sm py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <TrendingUp size={14} />
            Re-check after editing
          </button>
        </div>
      )}
    </div>
  );
};

export default AtsChecker;
