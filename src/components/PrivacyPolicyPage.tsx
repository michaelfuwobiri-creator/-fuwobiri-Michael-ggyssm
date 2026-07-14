import { 
  ArrowLeft, 
  Shield, 
  Database, 
  Clock, 
  Trash2, 
  Lock, 
  Globe, 
  Mail, 
  User, 
  Eye, 
  Briefcase, 
  CreditCard,
  Layers
} from "lucide-react";

interface PrivacyPolicyPageProps {
  onBack: () => void;
  userLoggedIn: boolean;
}

export default function PrivacyPolicyPage({ onBack, userLoggedIn }: PrivacyPolicyPageProps) {
  return (
    <div className="min-h-screen bg-sand text-gray-900 font-sans flex flex-col justify-between selection:bg-lime selection:text-forest animate-fade-in">
      
      {/* Header Bar */}
      <header className="no-print bg-white/85 backdrop-blur-md border-b border-gray-150 sticky top-0 z-50 transition-all">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-forest flex items-center justify-center font-display font-bold text-lime text-base shadow-sm">
              G
            </div>
            <div className="text-left leading-none">
              <span className="font-display font-bold text-base text-forest tracking-tight">gysm.io</span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 block font-bold font-sans">Legal &amp; Compliance</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="text-xs bg-white hover:bg-gray-50 text-gray-700 font-bold py-2 px-3.5 rounded-xl flex items-center space-x-1.5 transition-all border border-gray-200 cursor-pointer shadow-sm"
          >
            <ArrowLeft size={13} />
            <span>{userLoggedIn ? "Back to Workspace" : "Return to Login"}</span>
          </button>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-sm space-y-12">
          
          {/* Header Block */}
          <div className="border-b border-gray-100 pb-8 space-y-3">
            <div className="inline-flex items-center space-x-1.5 text-forest bg-forest/5 px-3 py-1 rounded-full text-xs font-semibold">
              <Shield size={13} />
              <span>Plain-Language &amp; Platform Compliant</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-forest tracking-tight">
              Privacy &amp; Data Protection Policy
            </h1>
            <p className="text-xs text-gray-400 font-mono">
              Last Updated: July 14, 2026 • Version 2.1
            </p>
            <p className="text-gray-600 text-sm leading-relaxed max-w-3xl">
              At gysm.io, we are dedicated to security, developer sandbox transparency, and providing tools to manage your independent finances and professional documents. This document outlines exactly what data is processed, how we preserve your privacy, and how you can exercise full control over your records.
            </p>
          </div>

          {/* Section 1: Data We Collect */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-sand-dark text-forest flex items-center justify-center">
                <Database size={16} />
              </div>
              <h2 className="text-xl font-display font-bold text-forest">1. What Data We Process &amp; Store</h2>
            </div>
            
            <p className="text-xs text-gray-600 leading-relaxed">
              We process data strictly to provide the tax and resume workspace services. This data is split into the following operational categories:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              <div className="p-5 bg-sand-dark rounded-2xl border border-gray-150 space-y-2.5">
                <div className="flex items-center space-x-2 text-forest font-bold text-xs uppercase tracking-wider">
                  <User size={14} />
                  <span>Account Credentials</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Your registered full name, email address, and a cryptographically hashed representation of your password. We also record the active session tokens when logged in.
                </p>
              </div>

              <div className="p-5 bg-sand-dark rounded-2xl border border-gray-150 space-y-2.5">
                <div className="flex items-center space-x-2 text-forest font-bold text-xs uppercase tracking-wider">
                  <Layers size={14} />
                  <span>Tax Ledger Workspace Logs</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  We process tax parameters including: gross income amounts, pension contribution rates, target countries, self-employed statuses, custom tax/social deduction parameters, mortgage interest details, and monthly financial ledger sheets.
                </p>
              </div>

              <div className="p-5 bg-sand-dark rounded-2xl border border-gray-150 space-y-2.5">
                <div className="flex items-center space-x-2 text-forest font-bold text-xs uppercase tracking-wider">
                  <Briefcase size={14} />
                  <span>Resume &amp; Document Data</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Candidate profile details (full name, email, phone number, physical location, and custom job title), professional summary statements, work experiences (employer, position, timeline, bullets), educational details, projects list, and generated cover letters.
                </p>
              </div>

              <div className="p-5 bg-sand-dark rounded-2xl border border-gray-150 space-y-2.5">
                <div className="flex items-center space-x-2 text-forest font-bold text-xs uppercase tracking-wider">
                  <CreditCard size={14} />
                  <span>Payment Metadata</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  If you purchase a sandbox license or upgrade, we maintain an subscription flag and a secure Stripe/RevenueCat identifier (e.g., <code className="bg-white/80 px-1 rounded text-[10px] text-red-600 font-mono">sub_gysm_mock_*</code>). We never collect or store physical raw credit card digits on our servers.
                </p>
              </div>

              <div className="p-5 bg-sand-dark rounded-2xl border border-gray-150 space-y-2.5">
                <div className="flex items-center space-x-2 text-forest font-bold text-xs uppercase tracking-wider">
                  <Globe size={14} />
                  <span>Location Settings</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Your selected target taxation country. This is used exclusively on the server to dynamically query national tax rules and currency configurations.
                </p>
              </div>

              <div className="p-5 bg-sand-dark rounded-2xl border border-gray-150 space-y-2.5">
                <div className="flex items-center space-x-2 text-forest font-bold text-xs uppercase tracking-wider">
                  <Eye size={14} />
                  <span>Technical &amp; Usage Metadata</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Basic browser user-agent info, system platform, local configuration times, and workspace autosave timestamps to protect your file states from crashes.
                </p>
              </div>

            </div>
          </section>

          {/* Section 2: Why We Collect It */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-sand-dark text-forest flex items-center justify-center">
                <Clock size={16} />
              </div>
              <h2 className="text-xl font-display font-bold text-forest">2. How Data is Processed &amp; Used</h2>
            </div>
            
            <p className="text-xs text-gray-600 leading-relaxed">
              We process your metrics and profiles based on these distinct operational pathways:
            </p>

            <ul className="list-disc pl-5 space-y-2 text-xs text-gray-500 leading-relaxed">
              <li>
                <strong>Active Synchronization:</strong> Automatically preserving draft resume records and calculated tax logs in local storage as you type to prevent accidental loss due to closed tabs.
              </li>
              <li>
                <strong>AI Tailoring Proxy:</strong> Dispatching specific bullet points, skills lists, job descriptions, or tax summaries server-side to the <strong>Google Gemini API</strong> to generate contextual cover letters, suggestions, or write-off strategies.
              </li>
              <li>
                <strong>Dynamic Tax Queries:</strong> Accessing expert global databases through Google Gemini server configurations to parse dynamic, single-person tax brackets and allowance models for your selected country.
              </li>
              <li>
                <strong>Authentication &amp; Protection:</strong> Verifying passwords safely on the backend, issuing clean sandboxed sessions, and managing secure subscription updates.
              </li>
            </ul>
          </section>

          {/* Section 3: Third Party Services */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-sand-dark text-forest flex items-center justify-center">
                <Globe size={16} />
              </div>
              <h2 className="text-xl font-display font-bold text-forest">3. Third-Party Integrations &amp; API Partners</h2>
            </div>
            
            <p className="text-xs text-gray-600 leading-relaxed">
              To keep your experience smooth and secure, we only share contextual requests with two named partners. No personal profiles are ever sold or leased:
            </p>

            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-forest">Google Gemini Developer Suite (3.5 Flash)</div>
                  <p className="text-[11px] text-gray-500">
                    Processes raw input prompts, job experiences, and tax categories server-side to generate resume text, advice, and country tax models.
                  </p>
                </div>
                <div className="text-[10px] bg-forest/5 text-forest font-bold px-2.5 py-1 rounded-lg border border-forest/10 shrink-0 self-start sm:self-center">
                  Server-to-Server Proxy
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-forest">Stripe Payment Gateway</div>
                  <p className="text-[11px] text-gray-500">
                    Manages premium subscription verification and terminates billing loops during account destruction workflows.
                  </p>
                </div>
                <div className="text-[10px] bg-forest/5 text-forest font-bold px-2.5 py-1 rounded-lg border border-forest/10 shrink-0 self-start sm:self-center">
                  Secure Billing Token
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Deletion & Retention */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-sand-dark text-forest flex items-center justify-center">
                <Trash2 size={16} />
              </div>
              <h2 className="text-xl font-display font-bold text-forest">4. Apple &amp; Google Compliant Deletion Flow</h2>
            </div>
            
            <p className="text-xs text-gray-600 leading-relaxed">
              We provide a fully automated, self-service account deletion protocol designed to meet <strong>Apple App Store Guideline 5.1.1(v)</strong> and <strong>Google Play</strong> user-data controls:
            </p>

            <div className="bg-amber-50/70 border border-amber-100 p-5 rounded-2xl space-y-3 text-amber-950">
              <h3 className="font-bold text-xs flex items-center space-x-1.5">
                <span>⏳</span>
                <span>The 30-Day Grace Period System</span>
              </h3>
              <p className="text-[11px] leading-relaxed">
                When you choose <strong>"Delete My Account"</strong> from your account settings panel, your login credentials are deactivated immediately, and all Stripe subscription billings are halted. 
              </p>
              <p className="text-[11px] leading-relaxed">
                A 30-day grace period is activated where your files are securely held. If you change your mind, simply log back into your profile before the 30-day limit. This will instantly revoke the deletion command and restore your workspaces.
              </p>
              <p className="text-[11px] leading-relaxed font-semibold">
                Once 30 days have elapsed, the automated backend cron completely and permanently purges your account files, tax spreadsheets, cover letters, and resume lists from the servers. This purge is irreversible.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-xs text-gray-800">Compliance Audit Logging (Zero-PII)</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                To satisfy corporate tax audit and platform legal requirements, a permanent zero-PII ledger entry is logged when deletions complete. This contains a cryptographically hashed signature of your email address (<code className="bg-sand-dark p-0.5 rounded text-[10px] font-mono">sha256</code>) and a generic timestamp, verifying deletion occurred without retaining your actual personal identity.
              </p>
            </div>
          </section>

          {/* Section 5: User Rights */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-sand-dark text-forest flex items-center justify-center">
                <Lock size={16} />
              </div>
              <h2 className="text-xl font-display font-bold text-forest">5. Your Privacy Rights</h2>
            </div>
            
            <p className="text-xs text-gray-600 leading-relaxed">
              You possess complete, self-service sovereignty over your personal data:
            </p>

            <ul className="list-disc pl-5 space-y-2 text-xs text-gray-500 leading-relaxed">
              <li>
                <strong>Right to Access:</strong> View all saved documents, active templates, and spreadsheets inside your dashboard dynamically.
              </li>
              <li>
                <strong>Right to Correction:</strong> Instantly alter any detail, title, figure, or password within your settings and profiles.
              </li>
              <li>
                <strong>Right to Export (Portability):</strong> Export your formatted resumes and cover letters as polished, print-ready PDF files directly from the template editors.
              </li>
              <li>
                <strong>Right to Deletion:</strong> Instantly queue your profile and files for irreversible destruction via the settings panel.
              </li>
            </ul>
          </section>

          {/* Section 6: Children's Privacy Statement */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-sand-dark text-forest flex items-center justify-center">
                <User size={16} />
              </div>
              <h2 className="text-xl font-display font-bold text-forest">6. Children's Privacy Protection</h2>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Our tools are intended for independent professionals, small businesses, and sandboxed developer operations. They are not designed or structured for children. We do not knowingly or intentionally collect personal details from users under <strong>16 years of age</strong>. If we identify that a minor has registered, the account is permanently terminated.
            </p>
          </section>

          {/* Section 7: Data Security Practices */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-sand-dark text-forest flex items-center justify-center">
                <Lock size={16} />
              </div>
              <h2 className="text-xl font-display font-bold text-forest">7. Professional Data Security</h2>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              We employ professional-grade containment procedures to protect your files: all connections utilize secure, TLS-encrypted HTTPS tunnels in transit. Backends utilize isolated sandbox filesystem permissions, and user password records are protected using strong cryptographical hashing.
            </p>
          </section>

          {/* Section 8: International Data Transfers */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-sand-dark text-forest flex items-center justify-center">
                <Globe size={16} />
              </div>
              <h2 className="text-xl font-display font-bold text-forest">8. International Data Transfers</h2>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your profile datasets are securely hosted and processed in the cloud (predominantly in the United States and European Union). When utilizing our generative resume and tax tools, contextual details are proxied through secure transit streams to Google Gemini services in accordance with global safe-data transfer paradigms.
            </p>
          </section>

          {/* Section 9: Changes to this Policy */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-sand-dark text-forest flex items-center justify-center">
                <Clock size={16} />
              </div>
              <h2 className="text-xl font-display font-bold text-forest">9. Changes to this Policy</h2>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              We may periodically revise this data protection document to align with latest tax regulations and App Store guidelines. If a material change occurs, we will notify users clearly via a persistent notification banner on our Login Screen or directly in the legal dashboard.
            </p>
          </section>

          {/* Section 10: Contact Information */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-sand-dark text-forest flex items-center justify-center">
                <Mail size={16} />
              </div>
              <h2 className="text-xl font-display font-bold text-forest">10. Contact Privacy &amp; Security</h2>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              If you have any inquiries regarding the data protection flow, our compliance procedures, or if you encounter issues executing self-service deletion, you can reach out directly:
            </p>
            <div className="p-5 bg-sand-dark rounded-2xl border border-gray-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-gray-800">gysm.io Compliance Desk</div>
                <div className="text-gray-500 text-[11px] font-mono">Email: privacy@gysm.io</div>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="bg-forest text-lime font-bold px-4 py-2.5 rounded-xl cursor-pointer hover:bg-forest-light text-xs transition-all self-start sm:self-center"
              >
                Return to App
              </button>
            </div>
          </section>

        </div>
      </main>

      {/* Humble Footer */}
      <footer className="bg-white border-t border-gray-150 py-8 text-center text-xs text-gray-400 font-sans">
        <p>© {new Date().getFullYear()} gysm.io. Privacy Policy compliant with modern security guidelines.</p>
      </footer>
    </div>
  );
}
