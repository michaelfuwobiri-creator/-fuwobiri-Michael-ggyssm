import { CVData } from "../types";
import { Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";

interface Props {
  data: CVData;
  coverLetterText: string;
}

export default function CoverLetterTemplateRenderer({ data, coverLetterText }: Props) {
  const { contact, template, skills } = data;

  const contactInfo = [
    { value: contact.email, icon: <Mail size={12} className="inline mr-1" /> },
    { value: contact.phone, icon: <Phone size={12} className="inline mr-1" /> },
    { value: contact.location, icon: <MapPin size={12} className="inline mr-1" /> },
    { value: contact.website, icon: <Globe size={12} className="inline mr-1" />, isLink: true },
    { value: contact.linkedin, icon: <Linkedin size={12} className="inline mr-1" />, isLink: true },
  ].filter(item => item.value);

  // Fallback placeholder content
  const displayText = coverLetterText || `Dear Hiring Team,

[Your customized AI cover letter will generate here once you enter a Job Description and click "Generate Cover Letter with AI".]

Sincerely,
${contact.fullName || "Your Full Name"}`;

  // Format paragraphs
  const paragraphs = displayText.split("\n\n").filter(p => p.trim());

  // Template 1: Classic Serif
  if (template === "Classic Serif") {
    return (
      <div className="p-8 md:p-12 bg-white text-black font-serif print-cv-container min-h-[297mm] shadow-lg border border-gray-100" id="cover-letter-preview-node">
        {/* Header */}
        <div className="text-center border-b pb-6 mb-8 border-gray-200">
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
                  <span className="text-gray-800">{info.value}</span>
                ) : (
                  <span>{info.value}</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="text-xs text-gray-500 font-sans mb-6">
          {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>

        {/* Body */}
        <div className="space-y-4 text-sm leading-relaxed text-gray-800 font-sans">
          {paragraphs.map((p, idx) => (
            <p key={idx} className="whitespace-pre-line text-justify">
              {p}
            </p>
          ))}
        </div>

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
      <div className="p-8 md:p-12 bg-white text-black font-sans print-cv-container min-h-[297mm] shadow-lg border border-gray-100 flex flex-col md:flex-row gap-8" id="cover-letter-preview-node">
        {/* Left Column (Sidebar) */}
        <div className="w-full md:w-1/3 md:border-r border-gray-100 pr-0 md:pr-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1 leading-none">
              {contact.fullName || "Your Name"}
            </h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {contact.jobTitle || "Your Job Title"}
            </p>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
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

          {/* Core Skills Summary (keeps side visual balance) */}
          {skills.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b pb-1 mb-2">
                Candidate Skills
              </h3>
              <div className="flex flex-wrap gap-1 mt-2">
                {skills.slice(0, 5).map((skill) => (
                  <span
                    key={skill.id}
                    className="px-2 py-0.5 text-[9px] font-medium bg-gray-100 text-gray-800 rounded-md"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Cover Letter Content) */}
        <div className="flex-1 space-y-4">
          {/* Date */}
          <div className="text-[11px] text-gray-400 font-medium">
            {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          {/* Letter Body */}
          <div className="space-y-4 text-xs leading-relaxed text-gray-600">
            {paragraphs.map((p, idx) => (
              <p key={idx} className="whitespace-pre-line text-justify">
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* AI Disclosure Footer */}
        <div className="mt-12 pt-4 border-t border-gray-100 text-center text-[9px] text-gray-400 font-sans tracking-wide w-full col-span-1 md:col-span-12">
          AI-Assisted Document Draft • Created via gysm.io
        </div>
      </div>
    );
  }

  // Template 3: Creative Bold
  if (template === "Creative Bold") {
    return (
      <div className="bg-white text-black font-sans print-cv-container min-h-[297mm] shadow-lg border border-gray-100 overflow-hidden" id="cover-letter-preview-node">
        {/* Colorful top banner */}
        <div className="bg-forest text-white p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-1">
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
          {/* Date */}
          <div className="text-xs font-mono text-gray-400">
            {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          {/* Letter Body */}
          <div className="space-y-4 text-xs leading-relaxed text-gray-700 border-l-2 border-forest/30 pl-4">
            {paragraphs.map((p, idx) => (
              <p key={idx} className="whitespace-pre-line text-justify">
                {p}
              </p>
            ))}
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
    <div className="p-8 md:p-10 bg-white text-black font-mono print-cv-container min-h-[297mm] shadow-lg border-2 border-gray-800" id="cover-letter-preview-node">
      {/* Header with terminal aesthetic */}
      <div className="border-b-2 border-gray-800 pb-5 mb-5">
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

      {/* Date */}
      <div className="text-[11px] text-gray-400 mb-4 uppercase">
        // DATE: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric' })}
      </div>

      <div className="text-xs text-gray-500 font-bold mb-2"># COVER_LETTER.md</div>

      {/* Letter Body */}
      <div className="space-y-4 text-xs leading-relaxed text-gray-700 pl-3 border-l-2 border-gray-200">
        {paragraphs.map((p, idx) => (
          <p key={idx} className="whitespace-pre-line text-justify">
            {p}
          </p>
        ))}
      </div>

      {/* AI Disclosure Footer */}
      <div className="mt-12 pt-4 border-t border-gray-150 text-center text-[9px] text-gray-400 font-mono tracking-wide">
        // AI-ASSISTED DOCUMENT DRAFT • GENERATED VIA GYSM.IO
      </div>
    </div>
  );
}
