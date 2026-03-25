import { forwardRef } from 'react';

/**
 * This component is rendered off-screen and used exclusively for printing/PDF.
 * It must be a forwardRef so react-to-print can access the DOM node.
 * It uses inline styles only — no Tailwind — to guarantee print fidelity.
 */
const ResumePrint = forwardRef(({ resume }, ref) => {
  if (!resume) return null;

  const {
    fullName, email, phone, location, linkedin, github, website, summary,
    experiences = [], educations = [], skills = [], projects = [],
  } = resume;

  // Group skills by category
  const grouped = skills.reduce((acc, s) => {
    const cat = s.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s.name);
    return acc;
  }, {});

  return (
    <div ref={ref} style={styles.page}>
      {/* ── HEADER ── */}
      <div style={styles.header}>
        <h1 style={styles.name}>{fullName}</h1>
        <div style={styles.contactRow}>
          {email    && <span style={styles.contact}>{email}</span>}
          {phone    && <span style={styles.contact}>{phone}</span>}
          {location && <span style={styles.contact}>{location}</span>}
          {linkedin && <span style={styles.contact}>{linkedin}</span>}
          {github   && <span style={styles.contact}>{github}</span>}
          {website  && <span style={styles.contact}>{website}</span>}
        </div>
      </div>

      {/* ── SUMMARY ── */}
      {summary && (
        <Section title="Professional Summary">
          <p style={styles.bodyText}>{summary}</p>
        </Section>
      )}

      {/* ── EXPERIENCE ── */}
      {experiences.length > 0 && (
        <Section title="Work Experience">
          {experiences.map((exp) => (
            <div key={exp.id} style={styles.entry}>
              <div style={styles.entryHeader}>
                <div>
                  <span style={styles.entryTitle}>{exp.position}</span>
                  <span style={styles.entrySubtitle}>
                    {' '}· {exp.company}{exp.location ? `, ${exp.location}` : ''}
                  </span>
                </div>
                <span style={styles.entryDate}>
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              {exp.description && (
                <div style={styles.bodyText}>
                  {exp.description.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* ── EDUCATION ── */}
      {educations.length > 0 && (
        <Section title="Education">
          {educations.map((edu) => (
            <div key={edu.id} style={styles.entry}>
              <div style={styles.entryHeader}>
                <div>
                  <span style={styles.entryTitle}>{edu.degree} in {edu.field}</span>
                  <span style={styles.entrySubtitle}> · {edu.institution}</span>
                  {edu.grade && <span style={styles.entrySubtitle}> · {edu.grade}</span>}
                </div>
                <span style={styles.entryDate}>
                  {edu.startDate} – {edu.endDate || 'Present'}
                </span>
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* ── SKILLS ── */}
      {skills.length > 0 && (
        <Section title="Skills">
          {Object.entries(grouped).map(([cat, names]) => (
            <div key={cat} style={styles.skillRow}>
              <span style={styles.skillCategory}>{cat}: </span>
              <span style={styles.bodyText}>{names.join(', ')}</span>
            </div>
          ))}
        </Section>
      )}

      {/* ── PROJECTS ── */}
      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((proj) => (
            <div key={proj.id} style={styles.entry}>
              <div style={styles.entryHeader}>
                <div>
                  <span style={styles.entryTitle}>{proj.name}</span>
                  {proj.techStack && (
                    <span style={styles.entrySubtitle}> · {proj.techStack}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {proj.liveUrl   && <span style={styles.link}>{proj.liveUrl}</span>}
                  {proj.githubUrl && <span style={styles.link}>{proj.githubUrl}</span>}
                </div>
              </div>
              {proj.description && (
                <p style={styles.bodyText}>{proj.description}</p>
              )}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
});

ResumePrint.displayName = 'ResumePrint';

// ── SECTION wrapper ──
const Section = ({ title, children }) => (
  <div style={styles.section}>
    <div style={styles.sectionTitle}>{title}</div>
    <div style={styles.sectionLine} />
    {children}
  </div>
);

// ── ALL STYLES (inline — print safe) ──
const styles = {
  page: {
    fontFamily: "'Times New Roman', Times, serif",
    fontSize: '11pt',
    lineHeight: '1.45',
    color: '#111',
    background: '#fff',
    width: '210mm',
    minHeight: '297mm',
    padding: '18mm 20mm',
    boxSizing: 'border-box',
    margin: '0 auto',
  },
  header: {
    borderBottom: '2px solid #1e3a8a',
    paddingBottom: '10px',
    marginBottom: '14px',
  },
  name: {
    fontSize: '22pt',
    fontWeight: 'bold',
    color: '#111',
    margin: '0 0 6px 0',
    letterSpacing: '-0.5px',
  },
  contactRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px 16px',
    fontSize: '9.5pt',
    color: '#444',
  },
  contact: {
    display: 'inline-block',
  },
  section: {
    marginBottom: '14px',
  },
  sectionTitle: {
    fontSize: '10.5pt',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    color: '#1e3a8a',
    marginBottom: '3px',
  },
  sectionLine: {
    borderBottom: '1px solid #c7d2fe',
    marginBottom: '8px',
  },
  entry: {
    marginBottom: '10px',
  },
  entryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '3px',
  },
  entryTitle: {
    fontWeight: 'bold',
    fontSize: '11pt',
    color: '#111',
  },
  entrySubtitle: {
    color: '#1e3a8a',
    fontSize: '10.5pt',
  },
  entryDate: {
    fontSize: '9.5pt',
    color: '#555',
    whiteSpace: 'nowrap',
    marginLeft: '8px',
    flexShrink: 0,
  },
  bodyText: {
    fontSize: '10.5pt',
    color: '#222',
    margin: '2px 0',
  },
  skillRow: {
    marginBottom: '4px',
    fontSize: '10.5pt',
  },
  skillCategory: {
    fontWeight: 'bold',
    color: '#111',
  },
  link: {
    fontSize: '9pt',
    color: '#1e3a8a',
  },
};

export default ResumePrint;
