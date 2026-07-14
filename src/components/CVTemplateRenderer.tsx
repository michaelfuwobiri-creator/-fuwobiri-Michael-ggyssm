import { CVData } from "../types";
import { Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";

interface Props {
  data: CVData;
}

export default function CVTemplateRenderer({ data }: Props) {
  const { contact, summary, experience, education, skills, projects, template, accentColor } = data;

  // Render contact icons
  const contactInfo = [
    { value: contact.email, icon: <Mail size={12} className="inline mr-1" /> },
    { value: contact.phone, icon: <Phone size={12} className="inline mr-1" /> },
    { value: contact.location, icon: <MapPin size={12} className="inline mr-1" /> },
    { value: contact.website, icon: <Globe size={12} className="inline mr-1" />, isLink: true },
    { value: contact.linkedin, icon: <Linkedin size={12} className="inline mr-1" />, isLink: true },
  ].filter(item => item.value);

  // Template 1: Classic Serif
  if (template === "Classic Serif") {
    return (
      <div className="p-8 md:p-12 bg-white text-black font-serif print-cv-container min-h-[297mm] shadow-lg border border-gray-100" id="cv-preview-node">
        {/* Header */}
        <div className="text-center border-b pb-6 mb-6 border-gray-200 print-section">
          <h1 className="text-3xl font-normal tracking-wide text-gray-900 mb-1 font-serif">
            {contact.fullName || "Your Full Name"}
          </h1>
          <p className="text-sm tracking-widest uppercase text-gray-500 font-sans mb-3">
            {contact.jobTitle || "Your Job Title / Profession"}
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-600 font-sans">
            {contactInfo.map((info, idx) => (
              <span key={idx} className="inline-flex items-center">
                {info.icon}
                {info.isLink ? (
                  <span className="hover:underline text-gray-800">{info.value}</span>
                ) : (
                  <span>{info.value}</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Professional Summary */}
        {summary && (
          <div className="mb-6 print-section">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 font-sans font-bold border-b pb-1 mb-2">
              Professional Summary
            </h2>
            <p className="text-sm leading-relaxed text-gray-700 italic">
              {summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-6 print-section">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 font-sans font-bold border-b pb-1 mb-3">
              Professional Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="print-section">
                  <div className="flex justify-between items-baseline mb-1">
                    <div>
                      <span className="font-bold text-sm text-gray-900">{exp.position}</span>
                      <span className="text-xs text-gray-400 mx-2">|</span>
                      <span className="text-sm text-gray-700 italic">{exp.company}</span>
                    </div>
                    <span className="text-xs text-gray-500 font-sans font-medium">
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  {exp.location && (
                    <p className="text-xs text-gray-500 mb-1 font-sans font-medium italic">{exp.location}</p>
                  )}
                  {exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside pl-4 space-y-1 mt-1 text-xs text-gray-700 leading-relaxed font-sans">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-6 print-section">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 font-sans font-bold border-b pb-1 mb-3">
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-start print-section text-sm">
                  <div>
                    <span className="font-bold text-gray-900">{edu.school}</span>
                    <p className="text-xs text-gray-700 italic">
                      {edu.degree} {edu.gpa ? `(GPA: ${edu.gpa})` : ""}
                    </p>
                    {edu.location && <p className="text-[10px] text-gray-500 font-sans">{edu.location}</p>}
                  </div>
                  <span className="text-xs text-gray-500 font-sans font-medium">{edu.graduationDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="mb-6 print-section">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 font-sans font-bold border-b pb-1 mb-3">
              Key Projects
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="print-section text-sm">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-gray-900">{proj.name}</span>
                    {proj.link && <span className="text-[10px] font-sans text-gray-500 underline">{proj.link}</span>}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed font-sans">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="print-section">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 font-sans font-bold border-b pb-1 mb-3">
              Skills & Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-2.5 py-1 text-[11px] font-sans bg-gray-50 text-gray-700 border border-gray-100 rounded-md font-medium"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Disclosure Footer */}
        <div className="mt-12 pt-4 border-t border-gray-100 text-center text-[9px] text-gray-400 font-sans tracking-wide">
          AI-Assisted Document Draft • Created via gysm.io
        </div>
      </div>
    );
  }

  // Template 2: Modern Minimalist
  if (template === "Modern Minimalist") {
    return (
      <div className="p-8 md:p-12 bg-white text-black font-sans print-cv-container min-h-[297mm] shadow-lg border border-gray-100 flex flex-col md:flex-row gap-8" id="cv-preview-node">
        {/* Left Column (Sidebar) */}
        <div className="w-full md:w-1/3 md:border-r border-gray-100 pr-0 md:pr-6 space-y-6">
          {/* Header */}
          <div className="print-section">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1 leading-none">
              {contact.fullName || "Your Name"}
            </h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {contact.jobTitle || "Your Job Title"}
            </p>
          </div>

          {/* Contact Details */}
          <div className="print-section space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b pb-1 mb-2">
              Contact
            </h3>
            <div className="space-y-1.5 text-xs text-gray-600">
              {contactInfo.map((info, idx) => (
                <div key={idx} className="flex items-start">
                  <span className="text-gray-400 mt-0.5 mr-2 shrink-0">{info.icon}</span>
                  <span className="break-all font-medium">{info.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="print-section">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b pb-1 mb-2">
                Expertise
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-800 rounded-md"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="print-section">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b pb-1 mb-2">
                Education
              </h3>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="text-xs leading-tight">
                    <p className="font-bold text-gray-900">{edu.school}</p>
                    <p className="text-gray-600">{edu.degree}</p>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-0.5 font-medium">
                      <span>{edu.graduationDate}</span>
                      {edu.location && <span>{edu.location}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Primary Info) */}
        <div className="flex-1 space-y-6">
          {/* Summary */}
          {summary && (
            <div className="print-section">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b pb-1 mb-2">
                Profile
              </h3>
              <p className="text-xs leading-relaxed text-gray-600">
                {summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="print-section">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b pb-1 mb-3">
                Experience
              </h3>
              <div className="space-y-5">
                {experience.map((exp) => (
                  <div key={exp.id} className="print-section">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-xs text-gray-900">{exp.position}</span>
                      <span className="text-[10px] font-medium text-gray-500">
                        {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 mb-2 font-medium">
                      <span className="italic">{exp.company}</span>
                      {exp.location && <span>{exp.location}</span>}
                    </div>
                    {exp.bullets.length > 0 && (
                      <ul className="list-disc pl-4 space-y-1 text-xs text-gray-600 leading-relaxed">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div className="print-section">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b pb-1 mb-3">
                Projects
              </h3>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="print-section text-xs">
                    <div className="flex justify-between font-bold text-gray-900 mb-0.5">
                      <span>{proj.name}</span>
                      {proj.link && <span className="text-[10px] font-normal text-gray-400 underline">{proj.link}</span>}
                    </div>
                    <p className="text-gray-600 leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Disclosure Footer */}
        <div className="mt-12 pt-4 border-t border-gray-100 text-center text-[9px] text-gray-400 font-sans tracking-wide w-full col-span-1 md:col-span-12">
          AI-Assisted Document Draft • Created via gysm.io
        </div>
      </div>
    );
  }

  // Template 3: Creative Bold (Luxurious forest theme)
  if (template === "Creative Bold") {
    return (
      <div className="bg-white text-black font-sans print-cv-container min-h-[297mm] shadow-lg border border-gray-100 overflow-hidden" id="cv-preview-node">
        {/* Colorful top banner */}
        <div className="bg-forest text-white p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print-invert-colors border-b border-gray-100">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-white print-invert-colors mb-1">
              {contact.fullName || "Your Full Name"}
            </h1>
            <p className="text-sm font-semibold tracking-wider text-lime uppercase">
              {contact.jobTitle || "Your Profession / Title"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-1.5 text-xs text-gray-200">
            {contactInfo.map((info, idx) => (
              <div key={idx} className="flex items-center">
                <span className="text-lime mr-2">{info.icon}</span>
                <span className="font-medium">{info.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 md:p-10 space-y-6">
          {/* Summary */}
          {summary && (
            <div className="print-section">
              <p className="text-sm leading-relaxed text-gray-700 font-sans border-l-4 border-forest pl-4 italic">
                {summary}
              </p>
            </div>
          )}

          {/* Two column grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Experience & Projects (2 cols) */}
            <div className="md:col-span-2 space-y-6">
              {experience.length > 0 && (
                <div className="print-section">
                  <h2 className="text-sm font-display font-bold tracking-wider text-forest uppercase border-b-2 border-lime pb-1 mb-4 flex items-center">
                    <span className="bg-forest text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2">01</span>
                    Work Experience
                  </h2>
                  <div className="space-y-5">
                    {experience.map((exp) => (
                      <div key={exp.id} className="relative pl-4 border-l border-gray-150">
                        {/* timeline dot */}
                        <div className="absolute w-2.5 h-2.5 bg-lime border border-forest rounded-full -left-[5.5px] top-1" />
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-bold text-sm text-gray-900">{exp.position}</span>
                          <span className="text-[10px] font-semibold text-gray-500 font-mono bg-gray-50 px-2 py-0.5 rounded-full">
                            {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2 font-medium">
                          <span className="font-semibold text-gray-700">{exp.company}</span>
                          {exp.location && <span> • {exp.location}</span>}
                        </div>
                        {exp.bullets.length > 0 && (
                          <ul className="list-disc pl-4 space-y-1 text-xs text-gray-600 leading-relaxed">
                            {exp.bullets.map((bullet, bIdx) => (
                              <li key={bIdx}>{bullet}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {projects.length > 0 && (
                <div className="print-section">
                  <h2 className="text-sm font-display font-bold tracking-wider text-forest uppercase border-b-2 border-lime pb-1 mb-4 flex items-center">
                    <span className="bg-forest text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2">02</span>
                    Featured Projects
                  </h2>
                  <div className="grid grid-cols-1 gap-3">
                    {projects.map((proj) => (
                      <div key={proj.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                        <div className="flex justify-between font-bold text-xs text-gray-900 mb-1">
                          <span>{proj.name}</span>
                          {proj.link && <span className="text-[10px] font-normal text-forest underline">{proj.link}</span>}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar (Skills & Education, 1 col) */}
            <div className="space-y-6">
              {skills.length > 0 && (
                <div className="print-section">
                  <h2 className="text-sm font-display font-bold tracking-wider text-forest uppercase border-b-2 border-lime pb-1 mb-3 flex items-center">
                    <span className="bg-forest text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2">03</span>
                    Skills
                  </h2>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-2.5 py-1 text-[10px] font-medium bg-forest/5 text-forest border border-forest/10 rounded-md"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {education.length > 0 && (
                <div className="print-section">
                  <h2 className="text-sm font-display font-bold tracking-wider text-forest uppercase border-b-2 border-lime pb-1 mb-3 flex items-center">
                    <span className="bg-forest text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2">04</span>
                    Education
                  </h2>
                  <div className="space-y-4">
                    {education.map((edu) => (
                      <div key={edu.id} className="text-xs">
                        <p className="font-bold text-gray-900">{edu.school}</p>
                        <p className="text-gray-700 italic">{edu.degree}</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-mono font-medium">
                          {edu.graduationDate} {edu.location ? `| ${edu.location}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Disclosure Footer */}
        <div className="mt-12 pt-4 border-t border-gray-100 text-center text-[9px] text-gray-400 font-sans tracking-wide">
          AI-Assisted Document Draft • Created via gysm.io
        </div>
      </div>
    );
  }

  // Template 4: Tech Mono (Monospace developer aesthetic)
  return (
    <div className="p-8 md:p-10 bg-white text-black font-mono print-cv-container min-h-[297mm] shadow-lg border-2 border-gray-800" id="cv-preview-node">
      {/* Header with terminal aesthetic */}
      <div className="border-b-2 border-gray-800 pb-5 mb-5 print-section">
        <div className="flex justify-between items-start flex-col sm:flex-row gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">
              &gt; {contact.fullName || "NAME_REQUIRED"}
            </h1>
            <p className="text-xs font-semibold text-gray-600 uppercase mt-1">
              [ROLE: {contact.jobTitle || "DEVELOPER_ENGINEER"}]
            </p>
          </div>
          <div className="text-xs text-gray-700 space-y-0.5 text-left sm:text-right">
            {contactInfo.map((info, idx) => (
              <div key={idx}>
                <span className="text-gray-500">//</span> {info.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-5 print-section text-xs">
          <p className="text-gray-500 mb-1 font-bold"># PROFILE.md</p>
          <p className="text-gray-700 leading-relaxed border-l-2 border-gray-300 pl-3">
            {summary}
          </p>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-5 print-section text-xs">
          <p className="text-gray-500 mb-2 font-bold"># CORE_SKILLS.json</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-50 p-3 border border-gray-200 rounded-md">
            {skills.map((skill) => (
              <div key={skill.id} className="text-[11px] text-gray-800 font-medium">
                * {skill.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-5 print-section text-xs">
          <p className="text-gray-500 mb-3 font-bold"># EXPERIENCE_LOG.sh</p>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="print-section border border-gray-200 p-3 rounded-md hover:bg-gray-50/50">
                <div className="flex justify-between items-start font-bold text-gray-900 mb-1">
                  <span>{exp.position} @ {exp.company}</span>
                  <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5">
                    {exp.startDate} - {exp.current ? "PRESENT" : exp.endDate}
                  </span>
                </div>
                {exp.location && <p className="text-[10px] text-gray-400 mb-2">// LOC: {exp.location}</p>}
                {exp.bullets.length > 0 && (
                  <ul className="space-y-1 pl-2">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-[11px] text-gray-600 leading-relaxed flex items-start">
                        <span className="text-gray-400 mr-2 shrink-0">-</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-5 print-section text-xs">
          <p className="text-gray-500 mb-3 font-bold"># REPOSITORIES.yml</p>
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id} className="print-section">
                <div className="flex justify-between font-bold text-gray-900 text-xs mb-1">
                  <span>- {proj.name}</span>
                  {proj.link && <span className="text-[10px] text-gray-400 underline">{proj.link}</span>}
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed pl-3 border-l border-gray-300">
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="print-section text-xs">
          <p className="text-gray-500 mb-3 font-bold"># ACADEMIC_RECORD.txt</p>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="print-section flex justify-between items-start text-xs">
                <div>
                  <span className="font-bold text-gray-900">{edu.school}</span>
                  <p className="text-gray-600 mt-0.5">
                    &gt; {edu.degree} {edu.gpa ? `(GPA: ${edu.gpa})` : ""}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400 font-bold">{edu.graduationDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Disclosure Footer */}
      <div className="mt-12 pt-4 border-t border-gray-150 text-center text-[9px] text-gray-400 font-mono tracking-wide">
        // AI-ASSISTED DOCUMENT DRAFT • GENERATED VIA GYSM.IO
      </div>
    </div>
  );
}
