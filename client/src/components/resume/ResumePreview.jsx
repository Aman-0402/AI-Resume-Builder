import { Mail, Phone, MapPin, Link, GitBranch, Globe } from 'lucide-react';

const ResumePreview = ({ resume }) => {
  if (!resume) return null;

  const {
    fullName, email, phone, location, linkedin, github, website, summary,
    experiences = [], educations = [], skills = [], projects = [],
  } = resume;

  const grouped = skills.reduce((acc, s) => {
    const cat = s.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s.name);
    return acc;
  }, {});

  return (
    <div className="bg-white text-gray-900 rounded-lg shadow-lg min-h-[842px] p-8 text-[11px] leading-relaxed font-sans">
      {/* Header */}
      <div className="border-b-2 border-indigo-600 pb-4 mb-5">
        <h1 className="text-2xl font-bold text-gray-900">{fullName || 'Your Name'}</h1>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-gray-500">
          {email    && <span className="flex items-center gap-1"><Mail size={9} />{email}</span>}
          {phone    && <span className="flex items-center gap-1"><Phone size={9} />{phone}</span>}
          {location && <span className="flex items-center gap-1"><MapPin size={9} />{location}</span>}
          {linkedin && <span className="flex items-center gap-1"><Link size={9} />{linkedin}</span>}
          {github   && <span className="flex items-center gap-1"><GitBranch size={9} />{github}</span>}
          {website  && <span className="flex items-center gap-1"><Globe size={9} />{website}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <Section title="Professional Summary">
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </Section>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <Section title="Work Experience">
          {experiences.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900">{exp.position}</p>
                  <p className="text-indigo-600 font-medium">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                </div>
                <p className="text-gray-400 text-right shrink-0 ml-4">
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </p>
              </div>
              {exp.description && (
                <div className="mt-1 text-gray-600 whitespace-pre-line">{exp.description}</div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Education */}
      {educations.length > 0 && (
        <Section title="Education">
          {educations.map((edu) => (
            <div key={edu.id} className="mb-2 flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-900">{edu.degree} in {edu.field}</p>
                <p className="text-indigo-600">{edu.institution}</p>
                {edu.grade && <p className="text-gray-400">{edu.grade}</p>}
              </div>
              <p className="text-gray-400 shrink-0 ml-4">{edu.startDate} – {edu.endDate || 'Present'}</p>
            </div>
          ))}
        </Section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Section title="Skills">
          {Object.entries(grouped).map(([cat, names]) => (
            <div key={cat} className="mb-1 flex gap-2">
              <span className="font-semibold text-gray-700 shrink-0 w-20">{cat}:</span>
              <span className="text-gray-600">{names.join(', ')}</span>
            </div>
          ))}
        </Section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((proj) => (
            <div key={proj.id} className="mb-3">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900">{proj.name}</p>
                {proj.techStack && (
                  <span className="text-indigo-500">· {proj.techStack}</span>
                )}
              </div>
              {proj.description && <p className="text-gray-600 mt-0.5">{proj.description}</p>}
              <div className="flex gap-3 mt-0.5">
                {proj.liveUrl   && <span className="text-blue-500">{proj.liveUrl}</span>}
                {proj.githubUrl && <span className="text-gray-400">{proj.githubUrl}</span>}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Empty state */}
      {!summary && !experiences.length && !educations.length && !skills.length && !projects.length && (
        <div className="flex items-center justify-center h-64 text-gray-300 text-center">
          <p>Fill in your details on the left<br />to see your resume preview here</p>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mb-5">
    <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 border-b border-gray-200 pb-1 mb-3">
      {title}
    </h2>
    {children}
  </div>
);

export default ResumePreview;
