import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Printer, 
  Briefcase, 
  GraduationCap, 
  User, 
  Settings, 
  Code, 
  Wrench,
  HelpCircle,
  Eye,
  FileText,
  RotateCcw,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { CVData, CVContact, CVExperience, CVEducation, CVSkill, CVProject, CVTemplate } from "../types";
import CVTemplateRenderer from "./CVTemplateRenderer";
import CoverLetterTemplateRenderer from "./CoverLetterTemplateRenderer";

export default function CVWorkspace() {
  // Main CV State with high-quality initial placeholder data
  const [cvData, setCvData] = useState<CVData>(() => {
    const saved = localStorage.getItem("cv_workspace_data");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    // Default high-quality resume to populate immediately
    return {
      template: "Classic Serif",
      accentColor: "#0c2e23",
      contact: {
        fullName: "Alexander Mercer",
        jobTitle: "Senior Solutions Architect & Consultant",
        email: "alexander.mercer@gmail.com",
        phone: "+44 (0) 7700 900077",
        location: "London, UK",
        website: "mercertech.io",
        linkedin: "linkedin.com/in/alex-mercer"
      },
      summary: "Results-driven Solutions Architect with over 8 years of experience designing and building secure cloud platforms, microservices architectures, and highly scalable data pipelines. Proven record of reducing server infrastructure costs by 35% while upgrading platform reliability to 99.99% uptime. Skilled in mentoring engineering teams and translating complex business requirements into high-performing code.",
      experience: [
        {
          id: "exp-1",
          company: "Vertex Cloud Solutions",
          position: "Lead Solutions Architect",
          location: "London, UK",
          startDate: "2023-01",
          endDate: "",
          current: true,
          bullets: [
            "Architected a cloud-native real-time trade execution platform for a tier-1 investment bank, processing over 120,000 transactions per second under peak loads.",
            "Led a cross-functional engineering team of 12 to migrate legacy on-prem services into containerized Kubernetes pods, accelerating deployment release cycles by 400%.",
            "Pioneered serverless API endpoints using Google Cloud Functions and Cloud Run, cutting cloud operational overhead expenses by £45,000 annually."
          ]
        },
        {
          id: "exp-2",
          company: "Nexus Software Inc",
          position: "Senior Full Stack Engineer",
          location: "San Francisco, CA (Remote)",
          startDate: "2019-05",
          endDate: "2022-12",
          current: false,
          bullets: [
            "Designed and implemented high-volume REST and GraphQL APIs using Node.js, Express, and PostgreSQL, supporting 2.5 million active daily users.",
            "Developed fully responsive bento-grid dashboards in React, Next.js, and Tailwind CSS, increasing platform engagement scores by 18%."
          ]
        }
      ],
      education: [
        {
          id: "edu-1",
          school: "University College London (UCL)",
          degree: "M.Sc. in Software Systems Engineering",
          location: "London, UK",
          graduationDate: "2018-09"
        },
        {
          id: "edu-2",
          school: "University of Bristol",
          degree: "B.Sc. in Computer Science (First Class Honours)",
          location: "Bristol, UK",
          graduationDate: "2017-06"
        }
      ],
      skills: [
        { id: "sk-1", name: "System Architecture", category: "Technical" },
        { id: "sk-2", name: "Kubernetes & Docker", category: "Technical" },
        { id: "sk-3", name: "Node.js & Express", category: "Technical" },
        { id: "sk-4", name: "React & Next.js", category: "Technical" },
        { id: "sk-5", name: "PostgreSQL & Redis", category: "Technical" },
        { id: "sk-6", name: "Team Leadership", category: "Soft" },
        { id: "sk-7", name: "Agile Methodologies", category: "Soft" },
        { id: "sk-8", name: "Solutions Consulting", category: "Soft" }
      ],
      projects: [
        {
          id: "proj-1",
          name: "SaaS Ledger Microservice",
          description: "An open-source distributed ledger engine designed for high-concurrency SaaS billing reconciliation. Handles double-entry book balancing with built-in audit trails.",
          link: "github.com/alex-mercer/ledger-service"
        }
      ]
    };
  });

  // UI Active builder tab
  const [activeTab, setActiveTab] = useState<"contact" | "experience" | "education" | "skills" | "projects" | "cover-letter">("contact");

  // Cover Letter states
  const [coverLetterJobDescription, setCoverLetterJobDescription] = useState<string>(() => {
    return localStorage.getItem("cl_job_description") || "";
  });
  const [coverLetterCompanyName, setCoverLetterCompanyName] = useState<string>(() => {
    return localStorage.getItem("cl_company_name") || "";
  });
  const [coverLetterJobTitle, setCoverLetterJobTitle] = useState<string>(() => {
    return localStorage.getItem("cl_job_title") || "";
  });
  const [coverLetterAdditionalInstructions, setCoverLetterAdditionalInstructions] = useState<string>(() => {
    return localStorage.getItem("cl_additional_instructions") || "";
  });
  const [coverLetterText, setCoverLetterText] = useState<string>(() => {
    return localStorage.getItem("cl_text") || "";
  });
  const [previewType, setPreviewType] = useState<"resume" | "cover-letter">("resume");

  // Local state for adding bullet draft to experience
  const [activeExpBulletInputs, setActiveExpBulletInputs] = useState<Record<string, string>>({});

  // AI helper states
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiStatusMessage, setAiStatusMessage] = useState<string>("");

  // Drag and drop states for list reordering
  const [draggedExpIndex, setDraggedExpIndex] = useState<number | null>(null);
  const [dragHoverExpIndex, setDragHoverExpIndex] = useState<number | null>(null);
  const [draggedSkillIndex, setDraggedSkillIndex] = useState<number | null>(null);
  const [dragHoverSkillIndex, setDragHoverSkillIndex] = useState<number | null>(null);
  const [draggedEduIndex, setDraggedEduIndex] = useState<number | null>(null);
  const [dragHoverEduIndex, setDragHoverEduIndex] = useState<number | null>(null);
  const [draggedProjIndex, setDraggedProjIndex] = useState<number | null>(null);
  const [dragHoverProjIndex, setDragHoverProjIndex] = useState<number | null>(null);

  // Autosave tracking states
  const [lastSaved, setLastSaved] = useState<string>(() => {
    return localStorage.getItem("cv_last_saved_time") || "";
  });
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved">("saved");

  // Single consolidated debounced autosave effect for the entire CV and Cover Letter workspace
  useEffect(() => {
    setSavingStatus("saving");
    const timer = setTimeout(() => {
      localStorage.setItem("cv_workspace_data", JSON.stringify(cvData));
      localStorage.setItem("cl_job_description", coverLetterJobDescription);
      localStorage.setItem("cl_company_name", coverLetterCompanyName);
      localStorage.setItem("cl_job_title", coverLetterJobTitle);
      localStorage.setItem("cl_additional_instructions", coverLetterAdditionalInstructions);
      localStorage.setItem("cl_text", coverLetterText);

      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastSaved(timeStr);
      localStorage.setItem("cv_last_saved_time", timeStr);
      setSavingStatus("saved");
    }, 1500); // 1.5s debounce to keep typing incredibly smooth and fast

    return () => clearTimeout(timer);
  }, [
    cvData,
    coverLetterJobDescription,
    coverLetterCompanyName,
    coverLetterJobTitle,
    coverLetterAdditionalInstructions,
    coverLetterText
  ]);

  // Update contact fields
  const handleContactChange = (field: keyof CVContact, val: string) => {
    setCvData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: val }
    }));
  };

  // Add items
  const addExperience = () => {
    const newItem: CVExperience = {
      id: "exp-" + Date.now(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      bullets: []
    };
    setCvData(prev => ({ ...prev, experience: [...prev.experience, newItem] }));
  };

  const addEducation = () => {
    const newItem: CVEducation = {
      id: "edu-" + Date.now(),
      school: "",
      degree: "",
      location: "",
      graduationDate: ""
    };
    setCvData(prev => ({ ...prev, education: [...prev.education, newItem] }));
  };

  const addProject = () => {
    const newItem: CVProject = {
      id: "proj-" + Date.now(),
      name: "",
      description: "",
      link: ""
    };
    setCvData(prev => ({ ...prev, projects: [...prev.projects, newItem] }));
  };

  const addSkill = (name: string, category: CVSkill["category"] = "Technical") => {
    if (!name.trim()) return;
    const exists = cvData.skills.some(s => s.name.toLowerCase() === name.toLowerCase());
    if (exists) return;

    const newItem: CVSkill = {
      id: "sk-" + Date.now(),
      name: name.trim(),
      category
    };
    setCvData(prev => ({ ...prev, skills: [...prev.skills, newItem] }));
  };

  // Delete items
  const deleteItem = (section: "experience" | "education" | "skills" | "projects", id: string) => {
    setCvData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((item: any) => item.id !== id)
    }));
  };

  // Move items up/down via buttons
  const moveExpItem = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= cvData.experience.length) return;

    const newExp = [...cvData.experience];
    const temp = newExp[idx];
    newExp[idx] = newExp[targetIdx];
    newExp[targetIdx] = temp;

    setCvData(prev => ({ ...prev, experience: newExp }));
  };

  const moveSkillItem = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= cvData.skills.length) return;

    const newSkills = [...cvData.skills];
    const temp = newSkills[idx];
    newSkills[idx] = newSkills[targetIdx];
    newSkills[targetIdx] = temp;

    setCvData(prev => ({ ...prev, skills: newSkills }));
  };

  const moveEduItem = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= cvData.education.length) return;

    const newEdu = [...cvData.education];
    const temp = newEdu[idx];
    newEdu[idx] = newEdu[targetIdx];
    newEdu[targetIdx] = temp;

    setCvData(prev => ({ ...prev, education: newEdu }));
  };

  const moveProjItem = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= cvData.projects.length) return;

    const newProj = [...cvData.projects];
    const temp = newProj[idx];
    newProj[idx] = newProj[targetIdx];
    newProj[targetIdx] = temp;

    setCvData(prev => ({ ...prev, projects: newProj }));
  };

  // Handle Drag & Drop drops
  const handleExpDrop = (targetIdx: number) => {
    if (draggedExpIndex === null || draggedExpIndex === targetIdx) return;
    const newExp = [...cvData.experience];
    const [removed] = newExp.splice(draggedExpIndex, 1);
    newExp.splice(targetIdx, 0, removed);
    setCvData(prev => ({ ...prev, experience: newExp }));
    setDraggedExpIndex(null);
    setDragHoverExpIndex(null);
  };

  const handleSkillDrop = (targetIdx: number) => {
    if (draggedSkillIndex === null || draggedSkillIndex === targetIdx) return;
    const newSkills = [...cvData.skills];
    const [removed] = newSkills.splice(draggedSkillIndex, 1);
    newSkills.splice(targetIdx, 0, removed);
    setCvData(prev => ({ ...prev, skills: newSkills }));
    setDraggedSkillIndex(null);
    setDragHoverSkillIndex(null);
  };

  const handleEduDrop = (targetIdx: number) => {
    if (draggedEduIndex === null || draggedEduIndex === targetIdx) return;
    const newEdu = [...cvData.education];
    const [removed] = newEdu.splice(draggedEduIndex, 1);
    newEdu.splice(targetIdx, 0, removed);
    setCvData(prev => ({ ...prev, education: newEdu }));
    setDraggedEduIndex(null);
    setDragHoverEduIndex(null);
  };

  const handleProjDrop = (targetIdx: number) => {
    if (draggedProjIndex === null || draggedProjIndex === targetIdx) return;
    const newProj = [...cvData.projects];
    const [removed] = newProj.splice(draggedProjIndex, 1);
    newProj.splice(targetIdx, 0, removed);
    setCvData(prev => ({ ...prev, projects: newProj }));
    setDraggedProjIndex(null);
    setDragHoverProjIndex(null);
  };

  // Update item fields
  const updateItemField = (section: "experience" | "education" | "projects", id: string, field: string, val: any) => {
    setCvData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).map((item: any) => {
        if (item.id === id) {
          return { ...item, [field]: val };
        }
        return item;
      })
    }));
  };

  // Bullet points handlers
  const addBulletToExperience = (expId: string) => {
    const text = activeExpBulletInputs[expId] || "";
    if (!text.trim()) return;

    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => {
        if (exp.id === expId) {
          return { ...exp, bullets: [...exp.bullets, text.trim()] };
        }
        return exp;
      })
    }));

    setActiveExpBulletInputs(prev => ({ ...prev, [expId]: "" }));
  };

  const deleteBulletFromExperience = (expId: string, idx: number) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => {
        if (exp.id === expId) {
          return { ...exp, bullets: exp.bullets.filter((_, bIdx) => bIdx !== idx) };
        }
        return exp;
      })
    }));
  };

  // Server-side AI: Bullet point polisher
  const handlePolishBullet = async (expId: string, bulletText: string, idx: number) => {
    if (!bulletText.trim()) return;
    
    const key = `bullet-${expId}-${idx}`;
    setAiLoading(prev => ({ ...prev, [key]: true }));
    setAiStatusMessage("Polishing bullet point with AI...");

    try {
      const res = await fetch("/api/cv/improve-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bullet: bulletText,
          jobTitle: cvData.contact.jobTitle || "Professional"
        })
      });

      const data = await res.json();
      if (res.ok && data.improvedBullet) {
        setCvData(prev => ({
          ...prev,
          experience: prev.experience.map(exp => {
            if (exp.id === expId) {
              const updatedBullets = [...exp.bullets];
              updatedBullets[idx] = data.improvedBullet;
              return { ...exp, bullets: updatedBullets };
            }
            return exp;
          })
        }));
      } else {
        alert(data.error || "Failed to polish bullet point");
      }
    } catch (err) {
      console.error(err);
      alert("Network error polishing bullet.");
    } finally {
      setAiLoading(prev => ({ ...prev, [key]: false }));
      setAiStatusMessage("");
    }
  };

  // Server-side AI: Generate summary bio
  const handleGenerateSummary = async () => {
    const key = "summary-gen";
    setAiLoading(prev => ({ ...prev, [key]: true }));
    setAiStatusMessage("Drafting professional profile summary...");

    const skillsList = cvData.skills.map(s => s.name).join(", ");
    const keyAchievements = cvData.experience.slice(0, 2).map(exp => `${exp.position} at ${exp.company}`).join(", ");

    try {
      const res = await fetch("/api/cv/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: cvData.contact.jobTitle || "Solutions Specialist",
          achievements: keyAchievements,
          skills: skillsList
        })
      });

      const data = await res.json();
      if (res.ok && data.summary) {
        setCvData(prev => ({ ...prev, summary: data.summary }));
      } else {
        alert(data.error || "Failed to generate professional summary");
      }
    } catch (err) {
      console.error(err);
      alert("Network error generating summary.");
    } finally {
      setAiLoading(prev => ({ ...prev, [key]: false }));
      setAiStatusMessage("");
    }
  };

  // Server-side AI: Suggest & auto-insert skills
  const handleSuggestSkills = async () => {
    const title = cvData.contact.jobTitle;
    if (!title) {
      alert("Please provide a Job Title in your Contact section first!");
      return;
    }

    const key = "skills-gen";
    setAiLoading(prev => ({ ...prev, [key]: true }));
    setAiStatusMessage(`Sourcing hot skills for ${title}...`);

    try {
      const res = await fetch("/api/cv/suggest-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: title })
      });

      const data = await res.json();
      if (res.ok && data.skills) {
        data.skills.forEach((skillName: string, idx: number) => {
          // Add first 4 as Technical, rest as Soft
          const cat: CVSkill["category"] = idx < 4 ? "Technical" : "Soft";
          addSkill(skillName, cat);
        });
      } else {
        alert(data.error || "Failed to fetch skills suggestions");
      }
    } catch (err) {
      console.error(err);
      alert("Network error suggesting skills.");
    } finally {
      setAiLoading(prev => ({ ...prev, [key]: false }));
      setAiStatusMessage("");
    }
  };

  // Server-side AI: Generate tailored cover letter
  const handleGenerateCoverLetter = async () => {
    if (!coverLetterJobDescription.trim()) {
      alert("Please paste the target Job Description first!");
      return;
    }

    const key = "cover-letter-gen";
    setAiLoading(prev => ({ ...prev, [key]: true }));
    setAiStatusMessage("Analyzing job description and crafting custom cover letter...");
    setPreviewType("cover-letter"); // Auto-switch view so they see it being populated

    try {
      const res = await fetch("/api/cv/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvData,
          jobDescription: coverLetterJobDescription,
          companyName: coverLetterCompanyName,
          jobTitle: coverLetterJobTitle || cvData.contact.jobTitle,
          additionalInstructions: coverLetterAdditionalInstructions,
        })
      });

      const data = await res.json();
      if (res.ok && data.coverLetter) {
        setCoverLetterText(data.coverLetter);
      } else {
        alert(data.error || "Failed to generate cover letter");
      }
    } catch (err) {
      console.error(err);
      alert("Network error generating cover letter.");
    } finally {
      setAiLoading(prev => ({ ...prev, [key]: false }));
      setAiStatusMessage("");
    }
  };

  // Reset CV to placeholder mock template
  const handleResetCV = () => {
    if (confirm("Reset CV details back to our professional template?")) {
      localStorage.removeItem("cv_workspace_data");
      localStorage.removeItem("cl_job_description");
      localStorage.removeItem("cl_company_name");
      localStorage.removeItem("cl_job_title");
      localStorage.removeItem("cl_additional_instructions");
      localStorage.removeItem("cl_text");
      window.location.reload();
    }
  };

  // Trigger browser print dialog for high-end PDF rendering
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-10">
      {/* Tab bar header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-5 no-print">
        <div className="text-left">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-sans font-bold tracking-widest bg-lime/25 text-forest px-3 py-1 rounded-full">
              CV GENERATOR & MAKER
            </span>
            <span className="inline-flex items-center space-x-1.5 text-[10px] text-gray-400 bg-white border border-gray-200 rounded-full px-2.5 py-0.5 font-mono shadow-sm no-print">
              <span className={`w-1.5 h-1.5 rounded-full ${savingStatus === "saving" ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`} />
              <span>{savingStatus === "saving" ? "Saving..." : lastSaved ? `Autosaved ${lastSaved}` : "Draft Autosaved"}</span>
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold text-forest tracking-tight mt-3">
            Build your professional CV.
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Choose a designer template, enrich your descriptors with AI, and download as clean PDF.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleResetCV}
            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 flex items-center space-x-1.5 cursor-pointer"
            title="Reset CV to Template"
          >
            <RotateCcw size={14} />
            <span>Reset Demo</span>
          </button>
          
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-forest hover:bg-forest-light border border-forest text-lime rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm cursor-pointer"
          >
            <Printer size={14} />
            <span>Export CV / Print PDF</span>
          </button>
        </div>
      </div>

      {/* Main Split workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column (Interactive edit form) */}
        <div className="lg:col-span-5 space-y-6 no-print">
          {/* Template select */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <label htmlFor="cv-template-select" className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              1. Choose a CV Template Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["Classic Serif", "Modern Minimalist", "Creative Bold", "Tech Mono"] as CVTemplate[]).map((t) => (
                <button
                  id="cv-template-select"
                  key={t}
                  type="button"
                  onClick={() => setCvData(prev => ({ ...prev, template: t }))}
                  className={`py-2 px-3 border rounded-xl text-xs font-bold font-sans transition-all text-left cursor-pointer ${
                    cvData.template === t
                      ? "border-forest bg-forest/5 text-forest"
                      : "border-gray-250 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Builder Sections Accordion Tabs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Tabs sidebar links */}
            <div className="flex border-b border-gray-100 overflow-x-auto text-xs font-sans">
              {[
                { id: "contact", label: "Contact", icon: <User size={14} /> },
                { id: "experience", label: "Work", icon: <Briefcase size={14} /> },
                { id: "education", label: "Education", icon: <GraduationCap size={14} /> },
                { id: "skills", label: "Skills", icon: <Wrench size={14} /> },
                { id: "projects", label: "Projects", icon: <Code size={14} /> },
                { id: "cover-letter", label: "Cover Letter", icon: <FileText size={14} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-4 py-3 border-b-2 font-bold cursor-pointer whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "border-forest text-forest bg-sand/50"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab content bodies */}
            <div className="p-5 space-y-6">
              {/* CONTACT TAB */}
              {activeTab === "contact" && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest border-b pb-1">
                    Personal Details
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div className="space-y-1">
                      <label htmlFor="contact-fullname" className="font-bold text-gray-600">Full Name</label>
                      <input
                        id="contact-fullname"
                        type="text"
                        value={cvData.contact.fullName}
                        onChange={(e) => handleContactChange("fullName", e.target.value)}
                        className="w-full bg-sand rounded-lg border border-gray-200 p-2 text-forest focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="contact-jobtitle" className="font-bold text-gray-600">Target Job Title / Profession</label>
                      <input
                        id="contact-jobtitle"
                        type="text"
                        value={cvData.contact.jobTitle}
                        onChange={(e) => handleContactChange("jobTitle", e.target.value)}
                        className="w-full bg-sand rounded-lg border border-gray-200 p-2 text-forest focus:outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="contact-email" className="font-bold text-gray-600">Email Address</label>
                        <input
                          id="contact-email"
                          type="email"
                          value={cvData.contact.email}
                          onChange={(e) => handleContactChange("email", e.target.value)}
                          className="w-full bg-sand rounded-lg border border-gray-200 p-2 text-forest focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="contact-phone" className="font-bold text-gray-600">Phone Number</label>
                        <input
                          id="contact-phone"
                          type="text"
                          value={cvData.contact.phone}
                          onChange={(e) => handleContactChange("phone", e.target.value)}
                          className="w-full bg-sand rounded-lg border border-gray-200 p-2 text-forest focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="contact-location" className="font-bold text-gray-600">Location (e.g. London, UK)</label>
                        <input
                          id="contact-location"
                          type="text"
                          value={cvData.contact.location}
                          onChange={(e) => handleContactChange("location", e.target.value)}
                          className="w-full bg-sand rounded-lg border border-gray-200 p-2 text-forest focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="contact-website" className="font-bold text-gray-600">Portfolio Website URL</label>
                        <input
                          id="contact-website"
                          type="text"
                          value={cvData.contact.website}
                          onChange={(e) => handleContactChange("website", e.target.value)}
                          className="w-full bg-sand rounded-lg border border-gray-200 p-2 text-forest focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="contact-linkedin" className="font-bold text-gray-600">LinkedIn Profile URL</label>
                      <input
                        id="contact-linkedin"
                        type="text"
                        value={cvData.contact.linkedin}
                        onChange={(e) => handleContactChange("linkedin", e.target.value)}
                        className="w-full bg-sand rounded-lg border border-gray-200 p-2 text-forest focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Summary bio with AI generator */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-baseline">
                      <label htmlFor="cv-summary-bio" className="text-xs font-bold text-gray-600 uppercase">Professional Summary</label>
                      <button
                        type="button"
                        onClick={handleGenerateSummary}
                        disabled={aiLoading["summary-gen"]}
                        className="text-[10px] font-bold text-forest hover:text-forest-light flex items-center space-x-1 cursor-pointer bg-lime/20 px-2 py-0.5 rounded"
                      >
                        <Sparkles size={11} className={aiLoading["summary-gen"] ? "animate-spin" : ""} />
                        <span>{aiLoading["summary-gen"] ? "Writing Summary..." : "Draft with AI"}</span>
                      </button>
                    </div>
                    <textarea
                      id="cv-summary-bio"
                      rows={4}
                      value={cvData.summary}
                      onChange={(e) => setCvData(prev => ({ ...prev, summary: e.target.value }))}
                      placeholder="Write a brief professional bio, or click 'Draft with AI' to let Gemini assemble one based on your current inputs..."
                      className="w-full bg-sand rounded-lg border border-gray-200 p-2 text-xs text-forest focus:outline-none font-sans leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* EXPERIENCE TAB */}
              {activeTab === "experience" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center border-b pb-1">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">
                      Work Experience
                    </h3>
                    <button
                      type="button"
                      onClick={addExperience}
                      className="px-2.5 py-1 bg-forest text-lime text-[11px] font-bold rounded-lg flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add Role</span>
                    </button>
                  </div>

                  {cvData.experience.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-4">No jobs added. Click Add Role to start.</p>
                  )}

                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
                    {cvData.experience.map((exp, idx) => {
                      const isDragging = draggedExpIndex === idx;
                      const isHovered = dragHoverExpIndex === idx;
                      return (
                        <div 
                          key={exp.id} 
                          draggable="true"
                          onDragStart={(e) => {
                            setDraggedExpIndex(idx);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                          }}
                          onDragEnter={() => {
                            setDragHoverExpIndex(idx);
                          }}
                          onDragLeave={() => {
                            if (dragHoverExpIndex === idx) setDragHoverExpIndex(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleExpDrop(idx);
                          }}
                          onDragEnd={() => {
                            setDraggedExpIndex(null);
                            setDragHoverExpIndex(null);
                          }}
                          className={`p-4 rounded-xl border space-y-3 text-xs relative transition-all duration-200 ${
                            isDragging 
                              ? "bg-forest/5 border-dashed border-forest opacity-50 shadow-inner scale-[0.98]" 
                              : isHovered
                              ? "bg-lime/5 border-2 border-forest ring-2 ring-forest/10 scale-[1.01] shadow-md"
                              : "bg-sand border-gray-200/80 hover:border-gray-300 hover:bg-sand/90"
                          }`}
                        >
                          <div className="flex justify-between items-center border-b border-gray-150/50 pb-2 mb-2 no-print select-none">
                            <div className="flex items-center space-x-2">
                              <div 
                                title="Drag to reorder"
                                className="p-1 text-gray-400 hover:text-forest cursor-grab active:cursor-grabbing shrink-0"
                              >
                                <GripVertical size={14} />
                              </div>
                              <div className="font-bold text-forest uppercase text-[10px] tracking-wider">
                                Role #{idx + 1} {exp.company ? `- ${exp.company}` : ""}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                title="Move Up"
                                disabled={idx === 0}
                                onClick={() => moveExpItem(idx, "up")}
                                className="p-1 text-gray-400 hover:text-forest hover:bg-white rounded transition-all disabled:opacity-20 disabled:hover:text-gray-400 disabled:hover:bg-transparent cursor-pointer"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button
                                type="button"
                                title="Move Down"
                                disabled={idx === cvData.experience.length - 1}
                                onClick={() => moveExpItem(idx, "down")}
                                className="p-1 text-gray-400 hover:text-forest hover:bg-white rounded transition-all disabled:opacity-20 disabled:hover:text-gray-400 disabled:hover:bg-transparent cursor-pointer"
                              >
                                <ArrowDown size={13} />
                              </button>
                              <div className="w-[1px] h-3 bg-gray-200 mx-1" />
                              <button
                                type="button"
                                onClick={() => deleteItem("experience", exp.id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                title="Delete Role"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label htmlFor={`exp-company-${exp.id}`} className="font-bold text-gray-600">Company Name</label>
                              <input
                                id={`exp-company-${exp.id}`}
                                type="text"
                                value={exp.company}
                                onChange={(e) => updateItemField("experience", exp.id, "company", e.target.value)}
                                className="w-full bg-white rounded border border-gray-150 p-1.5 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label htmlFor={`exp-position-${exp.id}`} className="font-bold text-gray-600">Job Title / Position</label>
                              <input
                                id={`exp-position-${exp.id}`}
                                type="text"
                                value={exp.position}
                                onChange={(e) => updateItemField("experience", exp.id, "position", e.target.value)}
                                className="w-full bg-white rounded border border-gray-150 p-1.5 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label htmlFor={`exp-startdate-${exp.id}`} className="font-bold text-gray-600">Start Date (e.g. 2024-01)</label>
                              <input
                                id={`exp-startdate-${exp.id}`}
                                type="text"
                                value={exp.startDate}
                                onChange={(e) => updateItemField("experience", exp.id, "startDate", e.target.value)}
                                className="w-full bg-white rounded border border-gray-150 p-1.5 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label htmlFor={`exp-enddate-${exp.id}`} className="font-bold text-gray-600">End Date</label>
                              <input
                                id={`exp-enddate-${exp.id}`}
                                type="text"
                                value={exp.endDate}
                                disabled={exp.current}
                                placeholder={exp.current ? "Current Role" : ""}
                                onChange={(e) => updateItemField("experience", exp.id, "endDate", e.target.value)}
                                className="w-full bg-white rounded border border-gray-150 p-1.5 focus:outline-none disabled:bg-gray-100"
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              id={`exp-current-${exp.id}`}
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) => updateItemField("experience", exp.id, "current", e.target.checked)}
                              className="rounded text-forest focus:ring-forest cursor-pointer"
                            />
                            <label htmlFor={`exp-current-${exp.id}`} className="font-medium text-gray-700 cursor-pointer">I currently work here</label>
                          </div>

                          <div className="space-y-1">
                            <label htmlFor={`exp-location-${exp.id}`} className="font-bold text-gray-600">Office Location (e.g. Paris, France)</label>
                            <input
                              id={`exp-location-${exp.id}`}
                              type="text"
                              value={exp.location}
                              onChange={(e) => updateItemField("experience", exp.id, "location", e.target.value)}
                              className="w-full bg-white rounded border border-gray-150 p-1.5 focus:outline-none"
                            />
                          </div>

                          {/* Bullets Sub List */}
                          <div className="border-t border-gray-150 pt-3 mt-3 space-y-2">
                            <span className="font-bold text-gray-600 uppercase text-[10px] tracking-wide block">
                              Key Achievements / Bullets
                            </span>

                            {/* Existing bullets with individual AI rewrite helper */}
                            <div className="space-y-1.5">
                              {exp.bullets.map((bullet, bIdx) => {
                                const bulletKey = `bullet-${exp.id}-${bIdx}`;
                                return (
                                  <div key={bIdx} className="flex items-start bg-white p-2 rounded border border-gray-150 gap-2">
                                    <span className="text-gray-400 mt-0.5">•</span>
                                    <p className="flex-1 text-[11px] leading-relaxed text-gray-700">{bullet}</p>
                                    
                                    <div className="flex items-center space-x-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handlePolishBullet(exp.id, bullet, bIdx)}
                                        disabled={aiLoading[bulletKey]}
                                        className="text-forest hover:text-forest-light bg-lime/10 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center space-x-0.5 cursor-pointer"
                                        title="Improve with Gemini AI"
                                      >
                                        <Sparkles size={10} className={aiLoading[bulletKey] ? "animate-spin" : ""} />
                                        <span>{aiLoading[bulletKey] ? "Polishing..." : "AI Polish"}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => deleteBulletFromExperience(exp.id, bIdx)}
                                        className="text-gray-300 hover:text-red-500 cursor-pointer"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Add bullet form */}
                            <div className="flex space-x-1.5">
                              <input
                                aria-label="Add description bullet"
                                type="text"
                                value={activeExpBulletInputs[exp.id] || ""}
                                onChange={(e) => setActiveExpBulletInputs(prev => ({ ...prev, [exp.id]: e.target.value }))}
                                placeholder="Type a new description bullet..."
                                className="flex-1 bg-white border border-gray-150 rounded px-2 py-1 text-[11px]"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addBulletToExperience(exp.id);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => addBulletToExperience(exp.id)}
                                className="bg-forest hover:bg-forest-light text-lime font-bold px-3 py-1 rounded text-[11px] cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* EDUCATION TAB */}
              {activeTab === "education" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center border-b pb-1">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">
                      Academic Background
                    </h3>
                    <button
                      type="button"
                      onClick={addEducation}
                      className="px-2.5 py-1 bg-forest text-lime text-[11px] font-bold rounded-lg flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add Education</span>
                    </button>
                  </div>

                  {cvData.education.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-4">No schools added yet.</p>
                  )}

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {cvData.education.map((edu, idx) => {
                      const isDragging = draggedEduIndex === idx;
                      const isHovered = dragHoverEduIndex === idx;
                      return (
                        <div 
                          key={edu.id} 
                          draggable="true"
                          onDragStart={(e) => {
                            setDraggedEduIndex(idx);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                          }}
                          onDragEnter={() => {
                            setDragHoverEduIndex(idx);
                          }}
                          onDragLeave={() => {
                            if (dragHoverEduIndex === idx) setDragHoverEduIndex(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleEduDrop(idx);
                          }}
                          onDragEnd={() => {
                            setDraggedEduIndex(null);
                            setDragHoverEduIndex(null);
                          }}
                          className={`p-4 rounded-xl border space-y-3 text-xs relative transition-all duration-200 ${
                            isDragging 
                              ? "bg-forest/5 border-dashed border-forest opacity-50 shadow-inner scale-[0.98]" 
                              : isHovered
                              ? "bg-lime/5 border-2 border-forest ring-2 ring-forest/10 scale-[1.01] shadow-md"
                              : "bg-sand border-gray-200/80 hover:border-gray-300 hover:bg-sand/90"
                          }`}
                        >
                          <div className="flex justify-between items-center border-b border-gray-150/50 pb-2 mb-2 no-print select-none">
                            <div className="flex items-center space-x-2">
                              <div 
                                title="Drag to reorder"
                                className="p-1 text-gray-400 hover:text-forest cursor-grab active:cursor-grabbing shrink-0"
                              >
                                <GripVertical size={14} />
                              </div>
                              <div className="font-bold text-forest uppercase text-[10px] tracking-wider">
                                Institution #{idx + 1} {edu.school ? `- ${edu.school}` : ""}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                title="Move Up"
                                disabled={idx === 0}
                                onClick={() => moveEduItem(idx, "up")}
                                className="p-1 text-gray-400 hover:text-forest hover:bg-white rounded transition-all disabled:opacity-20 disabled:hover:text-gray-400 disabled:hover:bg-transparent cursor-pointer"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button
                                type="button"
                                title="Move Down"
                                disabled={idx === cvData.education.length - 1}
                                onClick={() => moveEduItem(idx, "down")}
                                className="p-1 text-gray-400 hover:text-forest hover:bg-white rounded transition-all disabled:opacity-20 disabled:hover:text-gray-400 disabled:hover:bg-transparent cursor-pointer"
                              >
                                <ArrowDown size={13} />
                              </button>
                              <div className="w-[1px] h-3 bg-gray-200 mx-1" />
                              <button
                                type="button"
                                onClick={() => deleteItem("education", edu.id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                title="Delete Academic Item"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label htmlFor={`edu-school-${edu.id}`} className="font-bold text-gray-600">University / School</label>
                            <input
                              id={`edu-school-${edu.id}`}
                              type="text"
                              value={edu.school}
                              onChange={(e) => updateItemField("education", edu.id, "school", e.target.value)}
                              className="w-full bg-white rounded border border-gray-150 p-1.5 focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label htmlFor={`edu-degree-${edu.id}`} className="font-bold text-gray-600">Degree & Subject</label>
                              <input
                                id={`edu-degree-${edu.id}`}
                                type="text"
                                value={edu.degree}
                                onChange={(e) => updateItemField("education", edu.id, "degree", e.target.value)}
                                className="w-full bg-white rounded border border-gray-150 p-1.5 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label htmlFor={`edu-gpa-${edu.id}`} className="font-bold text-gray-600">Grade / GPA (Optional)</label>
                              <input
                                id={`edu-gpa-${edu.id}`}
                                type="text"
                                value={edu.gpa}
                                placeholder="e.g. 1st Class, 3.8/4.0"
                                onChange={(e) => updateItemField("education", edu.id, "gpa", e.target.value)}
                                className="w-full bg-white rounded border border-gray-150 p-1.5 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label htmlFor={`edu-graddate-${edu.id}`} className="font-bold text-gray-600">Graduation Date</label>
                              <input
                                id={`edu-graddate-${edu.id}`}
                                type="text"
                                value={edu.graduationDate}
                                placeholder="e.g. 2023-06"
                                onChange={(e) => updateItemField("education", edu.id, "graduationDate", e.target.value)}
                                className="w-full bg-white rounded border border-gray-150 p-1.5 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label htmlFor={`edu-location-${edu.id}`} className="font-bold text-gray-600">Location</label>
                              <input
                                id={`edu-location-${edu.id}`}
                                type="text"
                                value={edu.location}
                                onChange={(e) => updateItemField("education", edu.id, "location", e.target.value)}
                                className="w-full bg-white rounded border border-gray-150 p-1.5 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SKILLS TAB */}
              {activeTab === "skills" && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex justify-between items-center border-b pb-1">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">
                      Professional Expertise
                    </h3>
                    
                    <button
                      type="button"
                      onClick={handleSuggestSkills}
                      disabled={aiLoading["skills-gen"]}
                      className="text-[10px] font-bold text-forest hover:text-forest-light flex items-center space-x-1 cursor-pointer bg-lime/20 px-2.5 py-1 rounded-lg"
                    >
                      <Sparkles size={11} className={aiLoading["skills-gen"] ? "animate-spin" : ""} />
                      <span>{aiLoading["skills-gen"] ? "Sourcing..." : "AI Suggest Skills"}</span>
                    </button>
                  </div>

                  {/* Add manual skill */}
                  <div className="flex space-x-2 text-xs">
                    <input
                      aria-label="Add skill input"
                      id="manual-skill-input"
                      type="text"
                      placeholder="Type custom skill and press enter..."
                      className="flex-1 bg-sand border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-forest"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const target = e.currentTarget;
                          addSkill(target.value);
                          target.value = "";
                        }
                      }}
                    />
                  </div>

                  {/* Grouped Skills tags */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Active skills tags (Drag or use arrows to reorder)</span>
                    <div className="flex flex-wrap gap-2">
                      {cvData.skills.map((sk, idx) => {
                        const isDragging = draggedSkillIndex === idx;
                        const isHovered = dragHoverSkillIndex === idx;
                        return (
                          <div
                            key={sk.id}
                            draggable="true"
                            onDragStart={(e) => {
                              setDraggedSkillIndex(idx);
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                            }}
                            onDragEnter={() => {
                              setDragHoverSkillIndex(idx);
                            }}
                            onDragLeave={() => {
                              if (dragHoverSkillIndex === idx) setDragHoverSkillIndex(null);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              handleSkillDrop(idx);
                            }}
                            onDragEnd={() => {
                              setDraggedSkillIndex(null);
                              setDragHoverSkillIndex(null);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-2 shrink-0 transition-all duration-150 select-none ${
                              isDragging 
                                ? "bg-forest/10 border-dashed border-forest opacity-50 cursor-grabbing" 
                                : isHovered
                                ? "bg-lime/20 border-2 border-forest ring-1 ring-forest/20 cursor-grabbing scale-105 shadow-sm"
                                : "bg-sand border border-gray-150 text-gray-800 cursor-grab hover:bg-gray-50 hover:border-gray-300"
                            }`}
                          >
                            <GripVertical size={11} className="text-gray-400 cursor-grab active:cursor-grabbing shrink-0" />
                            <span>{sk.name}</span>
                            
                            <div className="flex items-center space-x-1 pl-1.5 border-l border-gray-250 ml-1 no-print">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveSkillItem(idx, "up")}
                                className="text-gray-400 hover:text-forest disabled:opacity-20 cursor-pointer"
                                title="Move Left"
                              >
                                <ArrowLeft size={11} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === cvData.skills.length - 1}
                                onClick={() => moveSkillItem(idx, "down")}
                                className="text-gray-400 hover:text-forest disabled:opacity-20 cursor-pointer"
                                title="Move Right"
                              >
                                <ArrowRight size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteItem("skills", sk.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer text-sm font-bold pl-0.5 leading-none"
                                title="Remove Skill"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* PROJECTS TAB */}
              {activeTab === "projects" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center border-b pb-1">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">
                      Portfolio Projects
                    </h3>
                    <button
                      type="button"
                      onClick={addProject}
                      className="px-2.5 py-1 bg-forest text-lime text-[11px] font-bold rounded-lg flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add Project</span>
                    </button>
                  </div>

                  {cvData.projects.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-4">No projects logged yet.</p>
                  )}

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {cvData.projects.map((proj, idx) => {
                      const isDragging = draggedProjIndex === idx;
                      const isHovered = dragHoverProjIndex === idx;
                      return (
                        <div 
                          key={proj.id} 
                          draggable="true"
                          onDragStart={(e) => {
                            setDraggedProjIndex(idx);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                          }}
                          onDragEnter={() => {
                            setDragHoverProjIndex(idx);
                          }}
                          onDragLeave={() => {
                            if (dragHoverProjIndex === idx) setDragHoverProjIndex(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleProjDrop(idx);
                          }}
                          onDragEnd={() => {
                            setDraggedProjIndex(null);
                            setDragHoverProjIndex(null);
                          }}
                          className={`p-4 rounded-xl border space-y-3 text-xs relative transition-all duration-200 ${
                            isDragging 
                              ? "bg-forest/5 border-dashed border-forest opacity-50 shadow-inner scale-[0.98]" 
                              : isHovered
                              ? "bg-lime/5 border-2 border-forest ring-2 ring-forest/10 scale-[1.01] shadow-md"
                              : "bg-sand border-gray-200/80 hover:border-gray-300 hover:bg-sand/90"
                          }`}
                        >
                          <div className="flex justify-between items-center border-b border-gray-150/50 pb-2 mb-2 no-print select-none">
                            <div className="flex items-center space-x-2">
                              <div 
                                title="Drag to reorder"
                                className="p-1 text-gray-400 hover:text-forest cursor-grab active:cursor-grabbing shrink-0"
                              >
                                <GripVertical size={14} />
                              </div>
                              <div className="font-bold text-forest uppercase text-[10px] tracking-wider">
                                Project #{idx + 1} {proj.name ? `- ${proj.name}` : ""}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                title="Move Up"
                                disabled={idx === 0}
                                onClick={() => moveProjItem(idx, "up")}
                                className="p-1 text-gray-400 hover:text-forest hover:bg-white rounded transition-all disabled:opacity-20 disabled:hover:text-gray-400 disabled:hover:bg-transparent cursor-pointer"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button
                                type="button"
                                title="Move Down"
                                disabled={idx === cvData.projects.length - 1}
                                onClick={() => moveProjItem(idx, "down")}
                                className="p-1 text-gray-400 hover:text-forest hover:bg-white rounded transition-all disabled:opacity-20 disabled:hover:text-gray-400 disabled:hover:bg-transparent cursor-pointer"
                              >
                                <ArrowDown size={13} />
                              </button>
                              <div className="w-[1px] h-3 bg-gray-200 mx-1" />
                              <button
                                type="button"
                                onClick={() => deleteItem("projects", proj.id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                title="Delete Project"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label htmlFor={`proj-name-${proj.id}`} className="font-bold text-gray-600">Project Name</label>
                              <input
                                id={`proj-name-${proj.id}`}
                                type="text"
                                value={proj.name}
                                onChange={(e) => updateItemField("projects", proj.id, "name", e.target.value)}
                                className="w-full bg-white rounded border border-gray-150 p-1.5 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label htmlFor={`proj-link-${proj.id}`} className="font-bold text-gray-600">Demo Link / Repo URL</label>
                              <input
                                id={`proj-link-${proj.id}`}
                                type="text"
                                value={proj.link}
                                placeholder="e.g. github.com/username/project"
                                onChange={(e) => updateItemField("projects", proj.id, "link", e.target.value)}
                                className="w-full bg-white rounded border border-gray-150 p-1.5 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label htmlFor={`proj-desc-${proj.id}`} className="font-bold text-gray-600">Description</label>
                            <textarea
                              id={`proj-desc-${proj.id}`}
                              rows={3}
                              value={proj.description}
                              onChange={(e) => updateItemField("projects", proj.id, "description", e.target.value)}
                              placeholder="Brief description of technologies used and goals achieved..."
                              className="w-full bg-white rounded border border-gray-150 p-1.5 focus:outline-none font-sans text-xs"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* COVER LETTER TAB */}
              {activeTab === "cover-letter" && (
                <div className="space-y-4 animate-fade-in text-xs">
                  <div className="flex justify-between items-center border-b pb-1">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">
                      AI Cover Letter Generator
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="cl-company-name" className="font-bold text-gray-600">Target Company Name</label>
                      <input
                        id="cl-company-name"
                        type="text"
                        value={coverLetterCompanyName}
                        onChange={(e) => setCoverLetterCompanyName(e.target.value)}
                        placeholder="e.g. Google, Stripe"
                        className="w-full bg-sand rounded-lg border border-gray-200 p-2 text-forest focus:outline-none focus:ring-1 focus:ring-forest"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="cl-job-title" className="font-bold text-gray-600">Target Job Title</label>
                      <input
                        id="cl-job-title"
                        type="text"
                        value={coverLetterJobTitle}
                        onChange={(e) => setCoverLetterJobTitle(e.target.value)}
                        placeholder={cvData.contact.jobTitle || "e.g. Solutions Architect"}
                        className="w-full bg-sand rounded-lg border border-gray-200 p-2 text-forest focus:outline-none focus:ring-1 focus:ring-forest"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <label htmlFor="cl-job-description" className="font-bold text-gray-600">Paste Target Job Description <span className="text-red-500">*</span></label>
                    </div>
                    <textarea
                      id="cl-job-description"
                      rows={6}
                      value={coverLetterJobDescription}
                      onChange={(e) => setCoverLetterJobDescription(e.target.value)}
                      placeholder="Paste the full job post details or requirements here. Gemini will analyze this text to match your CV skills, metrics, and experience directly to what they are looking for..."
                      className="w-full bg-sand rounded-lg border border-gray-200 p-2 text-forest focus:outline-none font-sans leading-relaxed text-xs focus:ring-1 focus:ring-forest"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="cl-additional" className="font-bold text-gray-600">Custom Guidance / Focus Instructions (Optional)</label>
                    <input
                      id="cl-additional"
                      type="text"
                      value={coverLetterAdditionalInstructions}
                      onChange={(e) => setCoverLetterAdditionalInstructions(e.target.value)}
                      placeholder="e.g., 'keep under 300 words' or 'emphasize SaaS billing ledger project'"
                      className="w-full bg-sand rounded-lg border border-gray-200 p-2 text-forest focus:outline-none focus:ring-1 focus:ring-forest"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateCoverLetter}
                    disabled={aiLoading["cover-letter-gen"]}
                    className="w-full py-2.5 bg-forest hover:bg-forest-light text-lime text-xs font-bold rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Sparkles size={14} className={aiLoading["cover-letter-gen"] ? "animate-spin" : ""} />
                    <span>{aiLoading["cover-letter-gen"] ? "Analyzing & Drafting Letter..." : "Generate Cover Letter with AI"}</span>
                  </button>

                  {coverLetterText && (
                    <div className="space-y-2 pt-4 border-t border-gray-150">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <label htmlFor="cl-text-editor" className="text-xs font-bold text-gray-700 uppercase">Edit Draft Cover Letter</label>
                          <span className="text-[8px] font-mono font-bold bg-forest/10 text-forest px-1.5 py-0.5 rounded uppercase">
                            AI-Drafted
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(coverLetterText);
                            alert("Cover letter text copied to clipboard!");
                          }}
                          className="text-[10px] font-bold text-forest hover:text-forest-light bg-lime/20 px-2 py-0.5 rounded cursor-pointer"
                        >
                          Copy Text
                        </button>
                      </div>
                      <textarea
                        id="cl-text-editor"
                        rows={10}
                        value={coverLetterText}
                        onChange={(e) => setCoverLetterText(e.target.value)}
                        className="w-full bg-sand rounded-lg border border-gray-200 p-3 text-forest focus:outline-none font-mono leading-relaxed text-xs focus:ring-1 focus:ring-forest"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* AI Helper overlay/status notifications */}
          {aiStatusMessage && (
            <div className="bg-forest text-white px-4 py-3 rounded-xl flex items-center space-x-2 text-xs font-medium animate-pulse shadow-md">
              <Sparkles className="text-lime" size={16} />
              <span>{aiStatusMessage}</span>
            </div>
          )}

          {/* Printing helper card */}
          <div className="bg-sand-dark p-4 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-2">
            <span className="font-bold text-gray-800 uppercase text-[10px] tracking-wider block">💡 Pro Printing Tips</span>
            <ul className="list-disc pl-4 space-y-1">
              <li>For clean PDF outputs, check <strong>"Hide Headers and Footers"</strong> in your browser print settings.</li>
              <li>Set margins to <strong>"None"</strong> or <strong>"Default"</strong>.</li>
              <li>Enable <strong>"Background Graphics"</strong> if templates contain colors (such as <i>Creative Bold</i>).</li>
            </ul>
          </div>
        </div>

        {/* Right column (Live high-fidelity interactive document preview) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-3 text-xs text-gray-400 font-sans no-print">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setPreviewType("resume")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                  previewType === "resume" ? "bg-forest text-lime shadow-sm" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                <User size={12} />
                <span>Resume CV</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewType("cover-letter")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                  previewType === "cover-letter" ? "bg-forest text-lime shadow-sm" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                <FileText size={12} />
                <span>Cover Letter</span>
              </button>
            </div>
            <span className="font-mono text-[10px]">A4 / Letter Proportions</span>
          </div>

          {/* Core high-fidelity preview box container */}
          <div className="print-cv-container overflow-hidden rounded-2xl md:shadow-md md:border md:border-gray-150">
            {previewType === "resume" ? (
              <CVTemplateRenderer data={cvData} />
            ) : (
              <CoverLetterTemplateRenderer data={cvData} coverLetterText={coverLetterText} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
