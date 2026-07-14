import { useState, useEffect } from "react";
import { 
  Calculator, 
  FileText, 
  Briefcase, 
  Coins, 
  ArrowUpRight,
  LogOut,
  UserCheck,
  Settings,
  ShieldAlert,
  AlertTriangle,
  Trash2,
  X,
  CheckCircle,
  Sparkles
} from "lucide-react";
import TaxWorkspace from "./components/TaxWorkspace";
import CVWorkspace from "./components/CVWorkspace";
import AuthPage from "./components/AuthPage";
import PrivacyPolicyPage from "./components/PrivacyPolicyPage";

interface UserSession {
  name: string;
  email: string;
}

export default function App() {
  // Navigation State: "tax" or "cv"
  const [activeWorkspace, setActiveWorkspace] = useState<"tax" | "cv">("tax");

  // Routing state for privacy policy and deep linking
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState(null, "", path);
    setCurrentPath(path);
  };

  // User Authentication Session State
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem("gysm_active_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Settings & Account Deletion Flow State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showAiDisclosure, setShowAiDisclosure] = useState<boolean>(() => {
    const saved = localStorage.getItem("gysm_active_user");
    const dismissed = localStorage.getItem("gysm_ai_disclosure_dismissed");
    return !!saved && !dismissed;
  });
  const [deletionStep, setDeletionStep] = useState<"none" | "confirm" | "progress" | "success">("none");
  const [deletionEmailInput, setDeletionEmailInput] = useState("");
  const [deletionChecked, setDeletionChecked] = useState(false);
  const [deletionProgressText, setDeletionProgressText] = useState("");
  const [deletionProgressPercent, setDeletionProgressPercent] = useState(0);
  const [deletionScheduledDate, setDeletionScheduledDate] = useState("");

  const startDeletionFlow = () => {
    setDeletionStep("confirm");
    setDeletionEmailInput("");
    setDeletionChecked(false);
  };

  const cancelDeletionFlow = () => {
    setDeletionStep("none");
  };

  const executeDeletion = () => {
    if (!user) return;
    if (deletionEmailInput.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
      alert("Email address does not match your active session.");
      return;
    }
    if (!deletionChecked) {
      alert("Please check the confirmation box to proceed.");
      return;
    }

    setDeletionStep("progress");
    setDeletionProgressPercent(15);
    setDeletionProgressText("Contacting security server to register deletion...");

    setTimeout(() => {
      setDeletionProgressPercent(45);
      setDeletionProgressText("Revoking active sessions and subscription records...");
    }, 500);

    fetch("/api/account/schedule-deletion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: user.email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDeletionProgressPercent(80);
          setDeletionProgressText("Auditing compliance rules and placing account in grace period...");
          setDeletionScheduledDate(data.scheduledDeletionAt);

          setTimeout(() => {
            setDeletionProgressPercent(100);
            setDeletionProgressText("Successfully registered scheduled account deletion.");
            setDeletionStep("success");
          }, 800);
        } else {
          setDeletionStep("none");
          alert(data.error || "An error occurred while scheduling deletion.");
        }
      })
      .catch((err) => {
        console.error(err);
        setDeletionStep("none");
        alert("Network error. Failed to reach security backend.");
      });
  };

  const finishDeletion = () => {
    // Clear active session to sign out
    localStorage.removeItem("gysm_active_user");
    
    // Set success message for the auth screen
    localStorage.setItem(
      "gysm_deletion_notice",
      "Your account has been scheduled for permanent deletion. You have 30 days to log back in if you wish to restore it."
    );
    
    setUser(null);
    setIsSettingsOpen(false);
    setDeletionStep("none");
  };

  const handleLogin = (session: UserSession) => {
    setUser(session);
    localStorage.setItem("gysm_active_user", JSON.stringify(session));
    if (!localStorage.getItem("gysm_ai_disclosure_dismissed")) {
      setShowAiDisclosure(true);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("gysm_active_user");
  };

  // Check if current page is the privacy policy route
  if (currentPath === "/privacy-policy") {
    return (
      <PrivacyPolicyPage 
        onBack={() => navigateTo("/")} 
        userLoggedIn={!!user} 
      />
    );
  }

  // If not logged in, render the login & security gate
  if (!user) {
    return <AuthPage onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-sand text-gray-900 font-sans flex flex-col justify-between selection:bg-lime selection:text-forest animate-fade-in">
      
      {/* 1. Luxurious Navigation Header (no-print hides this on PDF export!) */}
      <header className="no-print bg-white/80 backdrop-blur-md border-b border-gray-150 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand Accent */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-forest flex items-center justify-center font-display font-bold text-lime text-base shadow-sm">
              G
            </div>
            <div className="text-left leading-none">
              <span className="font-display font-bold text-base text-forest tracking-tight">gysm.io</span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 block font-bold font-sans">Workspace Suite</span>
            </div>
          </div>

          {/* Center Tabs Workspace Switchers */}
          <nav aria-label="Main Navigation" className="flex bg-sand-dark p-1 rounded-xl border border-gray-150 text-xs">
            <button
              type="button"
              onClick={() => setActiveWorkspace("tax")}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                activeWorkspace === "tax"
                  ? "bg-forest text-lime shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Calculator size={14} />
              <span>Tax Calculator &amp; Ledger</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveWorkspace("cv")}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                activeWorkspace === "cv"
                  ? "bg-forest text-lime shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <FileText size={14} />
              <span>CV &amp; Resume Builder</span>
            </button>
          </nav>

          {/* Right Accents */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2 bg-sand-dark px-3 py-1.5 rounded-xl border border-gray-150 text-[11px] font-medium text-gray-600">
              <UserCheck size={12} className="text-forest" />
              <span>{user.name}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setDeletionStep("none");
                setIsSettingsOpen(true);
              }}
              className="text-xs bg-white hover:bg-gray-50 text-gray-700 font-bold py-2 px-3 rounded-xl flex items-center space-x-1.5 transition-all border border-gray-200 cursor-pointer shadow-sm"
              title="Account Settings & Security"
            >
              <Settings size={13} className="text-gray-500" />
              <span>Account Settings</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-2 px-3 rounded-xl flex items-center space-x-1.5 transition-all border border-gray-200 cursor-pointer"
              title="Sign Out of Session"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <a 
              href="https://ai.studio/build" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden md:flex text-xs bg-forest hover:bg-forest-light text-lime font-bold py-2 px-3.5 rounded-xl items-center space-x-1 transition-all shadow-sm"
            >
              <span>AI Studio</span>
              <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </header>


      {/* 2. Main content coordinates workspace layout */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {activeWorkspace === "tax" ? (
          <div className="animate-fade-in">
            <TaxWorkspace />
          </div>
        ) : (
          <div className="animate-fade-in">
            <CVWorkspace />
          </div>
        )}
      </main>

      {/* 3. Humble, elegant Footer (no-print hides this on PDF export!) */}
      <footer className="no-print bg-white border-t border-gray-150 py-8 text-center text-xs text-gray-400 font-sans mt-12">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-forest flex items-center justify-center font-display font-bold text-lime text-[10px]">
              G
            </div>
            <span className="font-display font-medium text-forest">gysm.io Workspace</span>
          </div>
          <p>
            © {new Date().getFullYear()} gysm.io. Simple, serverless numbers &amp; profiles for smarter freelance decisions.
          </p>
          <div className="flex space-x-4 font-medium text-gray-500">
            <button type="button" onClick={() => setActiveWorkspace("tax")} className="hover:underline hover:text-forest cursor-pointer">Calculator</button>
            <button type="button" onClick={() => setActiveWorkspace("cv")} className="hover:underline hover:text-forest cursor-pointer">Resume Maker</button>
            <button type="button" onClick={() => navigateTo("/privacy-policy")} className="hover:underline hover:text-forest cursor-pointer">Privacy Policy</button>
          </div>
        </div>
      </footer>

      {/* 4. Compliant Account Settings & Deletion Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in no-print animate-fade-in" id="settings-modal-overlay">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center space-x-2">
                <Settings className="text-forest animate-spin-once" size={18} />
                <h2 className="font-display font-bold text-lg text-forest tracking-tight">Account Settings</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  setDeletionStep("none");
                }}
                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow text-xs text-gray-700 leading-relaxed">
              
              {deletionStep === "none" && (
                <div className="space-y-6">
                  {/* Account Profile Details */}
                  <div className="bg-sand-dark p-4 rounded-2xl border border-gray-150 space-y-3">
                    <h3 className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">User Profile</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-gray-400 font-mono font-bold uppercase">Name</div>
                        <div className="font-bold text-gray-800">{user.name}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-mono font-bold uppercase">Email Address</div>
                        <div className="font-bold text-gray-800 font-mono">{user.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Sandbox Policy & Storage */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">Active Sandboxed Storage</h3>
                    <p className="text-gray-500">
                      Your local workspaces for the <strong>gysm.io Tax Ledger</strong> and <strong>CV/Resume Builder</strong> are periodically synchronized to safe storage to protect against accidental browser tab closed events.
                    </p>
                  </div>

                  {/* AI Compliance & Disclosure Section */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-1.5 text-forest font-bold text-[11px] uppercase tracking-wider">
                      <Sparkles size={14} className="text-forest animate-pulse" />
                      <span>AI Technology Disclosure</span>
                    </div>
                    <div className="bg-sand p-4 rounded-2xl border border-gray-200/80 space-y-2.5">
                      <p className="text-gray-600">
                        This workspace integrates advanced AI features to assist in document drafting and country tax estimation:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-gray-500 font-medium">
                        <li><strong>AI Model</strong>: Powered by Google's industry-leading <strong>Gemini 2.5 Flash</strong> model via the official Google Gen AI SDK.</li>
                        <li><strong>Data Transmission & Processing</strong>: Only the specific text you enter inside the Cover Letter job description field, CV work summary, or Country Tax finder is securely sent to Google Gemini APIs to complete your requested action.</li>
                        <li><strong>Security & Privacy</strong>: None of your primary credentials, passwords, active ledger files, or database rows are shared with AI providers. All inputs are transmitted securely in transit using TLS 1.3 encryption.</li>
                      </ul>
                      <p className="text-[10px] text-gray-400 mt-1">
                        For complete details on data handling and privacy rights, see our detailed{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setIsSettingsOpen(false);
                            navigateTo("/privacy-policy");
                          }}
                          className="text-forest hover:underline font-bold cursor-pointer"
                        >
                          Privacy Policy
                        </button>
                        .
                      </p>
                    </div>
                  </div>

                  {/* Deletion Portal Triggers */}
                  <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1 sm:max-w-xs">
                      <div className="flex items-center space-x-1.5 text-red-600 font-bold text-[11px] uppercase tracking-wider">
                        <ShieldAlert size={14} />
                        <span>Danger Zone</span>
                      </div>
                      <p className="text-gray-500 text-[11px]">
                        Completely wipe your credentials, active sessions, saved tax spreadsheets, and CV resumes.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={startDeletionFlow}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-2 shrink-0 self-start sm:self-center"
                    >
                      <Trash2 size={13} />
                      <span>Delete My Account</span>
                    </button>
                  </div>
                </div>
              )}

              {deletionStep === "confirm" && (
                <div className="space-y-5 animate-fade-in text-left">
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-red-800">
                    <AlertTriangle className="shrink-0 text-red-600 mt-0.5" size={16} />
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm">Review Account Deletion Request</h4>
                      <p className="text-xs">
                        This operation is Apple App Store &amp; Google Play compliant and permanent. Wiping your data cannot be undone.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-800 text-[11px] uppercase tracking-wider">What Will Be Permanently Deleted:</h4>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-500 font-medium">
                      <li>Your account password and profile credentials (from the primary user registry).</li>
                      <li>All saved business tax logs, pension allocations, and ledger spreadsheet computations.</li>
                      <li>All professional resumes, work histories, templates, and generated cover letters.</li>
                      <li>Any active security sessions and authentication metadata.</li>
                    </ul>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-gray-150">
                    <h4 className="font-bold text-gray-800 text-[11px] uppercase tracking-wider">What Is Retained:</h4>
                    <p className="text-gray-500">
                      In strict compliance with statutory financial and audit guidelines, no personal data (PII) is retained. A cryptographically hashed zero-PII audit record is logged purely to verify fulfillment of App Store and Google Play compliance obligations.
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-gray-150">
                    <h4 className="font-bold text-gray-800 text-[11px] uppercase tracking-wider">30-Day Grace Period:</h4>
                    <p className="text-gray-500">
                      In accordance with platform guidelines, we provide a <strong>30-day grace period</strong>. Your account is immediately deactivated, but actual file purge does not occur until 30 days have elapsed. <strong>Logging back in at any time before then will cancel the scheduled deletion and restore your data.</strong>
                    </p>
                  </div>

                  {/* Re-authentication & Confirmation Form */}
                  <div className="bg-sand p-4 rounded-2xl border border-gray-150 space-y-4 pt-3">
                    <div className="space-y-1">
                      <label htmlFor="confirm-email" className="font-bold text-gray-700 uppercase tracking-wider block text-[10px]">
                        Re-enter Account Email to Confirm:
                      </label>
                      <input
                        id="confirm-email"
                        type="email"
                        value={deletionEmailInput}
                        onChange={(e) => setDeletionEmailInput(e.target.value)}
                        placeholder={user.email}
                        className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 text-forest focus:outline-none focus:ring-1 focus:ring-forest text-xs font-mono"
                      />
                    </div>

                    <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={deletionChecked}
                        onChange={(e) => setDeletionChecked(e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-forest focus:ring-forest focus:outline-none"
                      />
                      <span className="text-[11px] text-gray-600 font-medium">
                        I understand that this action is irreversible and I wish to place my account into the scheduled 30-day deletion queue.
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={executeDeletion}
                      disabled={deletionEmailInput.toLowerCase().trim() !== user.email.toLowerCase().trim() || !deletionChecked}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl cursor-pointer transition-all disabled:opacity-50 text-xs flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <Trash2 size={13} />
                      <span>Confirm &amp; Schedule Deletion</span>
                    </button>
                    <button
                      type="button"
                      onClick={cancelDeletionFlow}
                      className="bg-white border border-gray-250 hover:bg-gray-50 text-gray-600 font-bold py-3 px-4 rounded-xl cursor-pointer transition-all text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {deletionStep === "progress" && (
                <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-red-600 animate-spin flex items-center justify-center text-lg">
                    🛡️
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <h3 className="font-display font-bold text-base text-gray-800">Processing Deletion Request</h3>
                    <p className="text-xs text-gray-500 font-medium font-mono">{deletionProgressText}</p>
                  </div>
                  <div className="w-full max-w-xs bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-600 h-full transition-all duration-300"
                      style={{ width: `${deletionProgressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {deletionStep === "success" && (
                <div className="space-y-6 animate-fade-in text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto text-xl border border-green-100">
                    ✓
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-lg text-forest tracking-tight">Deletion Queue Scheduled</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      Your account (<strong>{user.email}</strong>) has been successfully placed in the scheduled purge queue.
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-amber-800 text-left text-xs space-y-2 max-w-md mx-auto">
                    <div className="font-bold flex items-center space-x-1">
                      <span>⏳</span>
                      <span>30-Day Grace Period Active</span>
                    </div>
                    <p className="leading-relaxed">
                      All data is scheduled for complete eradication on:
                      <strong className="block text-red-600 font-mono mt-0.5">{new Date(deletionScheduledDate).toLocaleString()}</strong>
                    </p>
                    <p className="text-[11px]">
                      Your session is now being invalidated. If you change your mind, simply log in within 30 days to instantly revoke this schedule and restore all files.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={finishDeletion}
                    className="w-full max-w-xs bg-forest hover:bg-forest-light text-lime font-bold py-3 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center space-x-2 shadow-sm text-xs"
                  >
                    <span>Close &amp; Secure Logout</span>
                    <LogOut size={13} />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 5. First-Use AI Disclosure & Transparency Modal */}
      {showAiDisclosure && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in no-print" id="ai-disclosure-modal-overlay">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6 space-y-5 animate-scale-up">
            <div className="flex items-center space-x-2.5 text-forest">
              <div className="p-2 bg-forest/5 rounded-xl text-forest">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <h2 className="font-display font-bold text-lg text-forest tracking-tight">AI Capability Transparency</h2>
            </div>

            <div className="space-y-3.5 text-xs text-gray-600 leading-relaxed">
              <p className="font-semibold text-gray-800">
                Welcome to gysm.io! We use secure, state-of-the-art Generative AI technology to accelerate your professional tasks.
              </p>
              
              <div className="bg-sand p-4 rounded-2xl border border-gray-150 space-y-2 font-medium">
                <div className="flex items-start space-x-2">
                  <span className="text-forest shrink-0 mt-0.5">✨</span>
                  <p className="text-gray-700">
                    <strong>Smart CV Enhancements:</strong> Instantly tailor professional resumes and draft highly personalized cover letters customized to specific job roles.
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-forest shrink-0 mt-0.5">✨</span>
                  <p className="text-gray-700">
                    <strong>Global Tax Assistance:</strong> Instantly fetch estimations for country-specific tax rules, allowances, and social security brackets globally.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-900 text-[11px] leading-snug space-y-1.5">
                <p className="font-bold flex items-center space-x-1.5">
                  <span>⚠️</span>
                  <span>AI Content Limitations</span>
                </p>
                <p>
                  While highly capable, AI models are predictive engines and **may occasionally generate inaccurate or stale content**. 
                </p>
                <p>
                  Always verify critical professional details, legal obligations, and tax computations with certified advisors or qualified experts before submission or filing.
                </p>
              </div>

              <p className="text-[10px] text-gray-400">
                To review data routing, model parameters, or to read your opt-out rights, click on{" "}
                <button
                  type="button"
                  onClick={() => {
                    setShowAiDisclosure(false);
                    localStorage.setItem("gysm_ai_disclosure_dismissed", "true");
                    setIsSettingsOpen(true);
                  }}
                  className="text-forest hover:underline font-bold cursor-pointer"
                >
                  Account Settings
                </button>{" "}
                at any time.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAiDisclosure(false);
                localStorage.setItem("gysm_ai_disclosure_dismissed", "true");
              }}
              className="w-full bg-forest hover:bg-forest-light text-lime font-bold py-3 rounded-xl transition-all cursor-pointer shadow-sm text-xs text-center"
            >
              I Understand &amp; Acknowledge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
