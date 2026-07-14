export type TaxCountry = "US" | "UK" | "Custom" | "Dynamic";
export type TaxYear = "2026/27" | "2025/26" | "Custom";

export interface TaxBracket {
  rate: number; // percentage, e.g. 20 or 40
  threshold: number; // starting limit
  taxableAmount: number;
  taxCharged: number;
}

export type ExpenseCategory = 
  | "Software & SaaS"
  | "Office Rent & Coworking"
  | "Hardware & Equipment"
  | "Marketing & Advertising"
  | "Travel & Transport"
  | "Meals & Entertainment"
  | "Legal & Professional"
  | "Other Expenses";

export interface BusinessExpense {
  id: string;
  date: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
}

export interface MonthlyFreelanceLog {
  id: string;
  month: string; // e.g. "2026-07"
  grossIncome: number;
  expenses: BusinessExpense[];
}

// CV Builder types
export type CVTemplate = "Classic Serif" | "Modern Minimalist" | "Creative Bold" | "Tech Mono";

export interface CVContact {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
}

export interface CVExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface CVEducation {
  id: string;
  school: string;
  degree: string;
  location: string;
  graduationDate: string;
  gpa?: string;
}

export interface CVSkill {
  id: string;
  name: string;
  category: "Technical" | "Soft" | "Languages" | "Tools";
}

export interface CVProject {
  id: string;
  name: string;
  description: string;
  link?: string;
}

export interface CVData {
  template: CVTemplate;
  accentColor: string; // Hex color for highlights
  contact: CVContact;
  summary: string;
  experience: CVExperience[];
  education: CVEducation[];
  skills: CVSkill[];
  projects: CVProject[];
}
