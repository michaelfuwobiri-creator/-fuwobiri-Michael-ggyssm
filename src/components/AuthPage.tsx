import React, { useState } from "react";
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Sparkles, 
  Chrome, 
  ArrowLeft, 
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";

interface Props {
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

type AuthScreen = "login" | "signup" | "forgotten" | "reset";

export default function AuthPage({ onLoginSuccess }: Props) {
  const [screen, setScreen] = useState<AuthScreen>("login");
  
  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & Validation States
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Reactivation flow state
  const [pendingReactivation, setPendingReactivation] = useState<{
    email: string;
    name: string;
    scheduledDeletionAt: string;
    requestedAt: string;
  } | null>(null);

  // Check for account deletion notice on mount
  React.useEffect(() => {
    const notice = localStorage.getItem("gysm_deletion_notice");
    if (notice) {
      setSuccess(notice);
      localStorage.removeItem("gysm_deletion_notice");
    }
  }, []);

  // Helper to load users from localStorage
  const getRegisteredUsers = (): Record<string, { name: string; pass: string }> => {
    const usersStr = localStorage.getItem("gysm_registered_users");
    if (usersStr) {
      try {
        return JSON.parse(usersStr);
      } catch (e) {
        return {};
      }
    }
    // Seed with a default demo account so the user can easily log in immediately
    return {
      "demo@gysm.io": { name: "Demo User", pass: "password123" }
    };
  };

  // Helper to save users to localStorage
  const saveRegisteredUsers = (users: Record<string, { name: string; pass: string }>) => {
    localStorage.setItem("gysm_registered_users", JSON.stringify(users));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const users = getRegisteredUsers();
      const lowerEmail = email.toLowerCase().trim();
      const user = users[lowerEmail];

      if (user && user.pass === password) {
        // Credentials valid, let's check deletion status on the backend
        fetch(`/api/account/deletion-status?email=${encodeURIComponent(lowerEmail)}`)
          .then((res) => res.json())
          .then((statusData) => {
            if (statusData.pending) {
              setPendingReactivation({
                email: lowerEmail,
                name: user.name,
                scheduledDeletionAt: statusData.scheduledDeletionAt,
                requestedAt: statusData.requestedAt,
              });
              setLoading(false);
            } else {
              onLoginSuccess({ name: user.name, email: lowerEmail });
            }
          })
          .catch((err) => {
            console.error("Failed to fetch deletion status:", err);
            // Fallback: log in directly anyway
            onLoginSuccess({ name: user.name, email: lowerEmail });
          });
      } else {
        setError("Incorrect email address or password. Try demo@gysm.io with password123!");
        setLoading(false);
      }
    }, 800);
  };

  const handleReactivate = () => {
    if (!pendingReactivation) return;
    setLoading(true);
    setError("");
    setSuccess("");

    fetch("/api/account/cancel-deletion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pendingReactivation.email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSuccess("Welcome back! Your account has been fully reactivated and the scheduled data deletion has been terminated.");
          setTimeout(() => {
            onLoginSuccess({ name: pendingReactivation.name, email: pendingReactivation.email });
          }, 1500);
        } else {
          setError(data.error || "Failed to cancel account deletion. Please try again.");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Network error. Please try again.");
        setLoading(false);
      });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const users = getRegisteredUsers();
      const lowerEmail = email.toLowerCase().trim();

      if (users[lowerEmail]) {
        setError("An account with this email already exists.");
        setLoading(false);
        return;
      }

      // Register user
      users[lowerEmail] = { name: name.trim(), pass: password };
      saveRegisteredUsers(users);

      setSuccess("Account created successfully! Logging you in...");
      setTimeout(() => {
        onLoginSuccess({ name: name.trim(), email: lowerEmail });
      }, 1000);
    }, 800);
  };

  // Forgotten password logic
  const handleForgottenPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const users = getRegisteredUsers();
      const lowerEmail = email.toLowerCase().trim();

      if (!users[lowerEmail]) {
        setError("No account found with this email address.");
        setLoading(false);
        return;
      }

      // Simulate sending recovery email
      setSuccess(`A password recovery token has been authorized for ${lowerEmail}!`);
      setLoading(false);
      
      // Pivot to Create New Password screen directly so the user can easily experience the reset process
      setTimeout(() => {
        setScreen("reset");
        setSuccess("");
      }, 2000);
    }, 1000);
  };

  // Create new password logic
  const handleCreateNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const users = getRegisteredUsers();
      const lowerEmail = email.toLowerCase().trim() || "demo@gysm.io";

      if (users[lowerEmail]) {
        users[lowerEmail].pass = newPassword;
        saveRegisteredUsers(users);
        setSuccess("Your new password has been set successfully!");
        setLoading(false);
        setTimeout(() => {
          setScreen("login");
          setPassword("");
          setSuccess("");
        }, 1500);
      } else {
        setError("Session expired. Please try again.");
        setLoading(false);
      }
    }, 900);
  };

  // Simulate official Google Sign In
  const handleGoogleSignIn = () => {
    setError("");
    setSuccess("");
    setLoading(true);

    setTimeout(() => {
      const googleUser = {
        name: "Google Explorer",
        email: "explorer@gmail.com"
      };
      
      // Auto register if not exists
      const users = getRegisteredUsers();
      if (!users[googleUser.email]) {
        users[googleUser.email] = { name: googleUser.name, pass: "google-auth-pass" };
        saveRegisteredUsers(users);
      }

      setSuccess("Successfully authenticated via Google Secure Account!");
      setTimeout(() => {
        onLoginSuccess(googleUser);
      }, 1000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-sand flex flex-col justify-between selection:bg-lime selection:text-forest font-sans">
      
      {/* Upper Brand Accent */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-forest flex items-center justify-center font-display font-bold text-lime text-base shadow-sm">
            G
          </div>
          <span className="font-display font-bold text-base text-forest tracking-tight">gysm.io</span>
        </div>
        <span className="text-xs text-gray-400 font-mono">Secure Auth Gateway</span>
      </div>

      {/* Main Form Center Stage */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-sm space-y-6">
          
          {pendingReactivation ? (
            <div className="space-y-6 text-left animate-fade-in">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto text-xl border border-amber-100">
                  ⏳
                </div>
                <h1 className="text-2xl font-display font-bold text-forest tracking-tight">
                  Restore Your Account
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  This profile is currently scheduled for permanent deletion.
                </p>
              </div>

              {/* Feedback alerts */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium flex items-center space-x-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-100 text-green-700 rounded-xl text-xs font-medium flex items-center space-x-2">
                  <CheckCircle size={14} className="shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800 space-y-2 text-xs">
                <p className="leading-relaxed">
                  The account for <strong>{pendingReactivation.email}</strong> is scheduled for complete, irreversible destruction.
                </p>
                <div className="text-[10px] font-mono mt-1 bg-white/60 p-2 rounded-lg border border-amber-200 space-y-1">
                  <div>Permanent purging scheduled on:</div>
                  <div className="font-bold text-red-600">
                    {new Date(pendingReactivation.scheduledDeletionAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 leading-relaxed space-y-2">
                <p>
                  To satisfy <strong>Apple App Store Guideline 5.1.1(v)</strong> and <strong>Google Play</strong> policies, we provide a 30-day grace period where you can self-restore your account.
                </p>
                <p>
                  Clicking the button below will instantly revoke the scheduled deletion request, reactivate your profile, and recover all of your saved resume data and tax logs.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleReactivate}
                  disabled={loading}
                  className="w-full bg-forest hover:bg-forest-light text-lime font-bold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm disabled:opacity-85"
                >
                  <span>{loading ? "Reactivating Account..." : "Yes, Restore My Account & Log In"}</span>
                  {!loading && <CheckCircle size={14} />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPendingReactivation(null);
                    setError("");
                    setSuccess("");
                  }}
                  disabled={loading}
                  className="w-full bg-white border border-gray-200 text-gray-600 font-bold text-xs py-2.5 rounded-xl text-center cursor-pointer hover:bg-gray-50"
                >
                  Keep Scheduled Deletion
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Form Header Title */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-display font-bold text-forest tracking-tight">
                  {screen === "login" && "Welcome back"}
                  {screen === "signup" && "Create your account"}
                  {screen === "forgotten" && "forgotten password"}
                  {screen === "reset" && "create new password"}
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  {screen === "login" && "Login to manage your business taxes and professional CVs."}
                  {screen === "signup" && "Sign up for a secure Gysm sandbox developer account."}
                  {screen === "forgotten" && "Enter your email address below to reset your secure account password."}
                  {screen === "reset" && "Enter a strong, secure new password for your account."}
                </p>
              </div>

              {/* Feedback alerts */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium flex items-center space-x-2 animate-fade-in">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-100 text-green-700 rounded-xl text-xs font-medium flex items-center space-x-2 animate-fade-in">
                  <CheckCircle size={14} className="shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* 1. LOGIN SCREEN */}
              {screen === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1 text-xs">
                    <label htmlFor="login-email" className="font-bold text-gray-700 uppercase tracking-wider block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        id="login-email"
                        type="email"
                        required
                        placeholder="e.g. demo@gysm.io"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-sand-dark border border-gray-150 rounded-xl py-2.5 pl-9 pr-3 text-forest focus:outline-none focus:ring-1 focus:ring-forest text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <label htmlFor="login-password" className="font-bold text-gray-700 uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setScreen("forgotten")}
                        className="text-forest hover:underline font-bold"
                      >
                        forgotten password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="e.g. password123"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-sand-dark border border-gray-150 rounded-xl py-2.5 pl-9 pr-10 text-forest focus:outline-none focus:ring-1 focus:ring-forest text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-forest"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-forest hover:bg-forest-light text-lime font-bold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm mt-2 disabled:opacity-80"
                  >
                    <span>{loading ? "Verifying..." : "Sign In"}</span>
                    {!loading && <ArrowRight size={14} />}
                  </button>
                </form>
              )}

              {/* 2. SIGNUP SCREEN */}
              {screen === "signup" && (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-1 text-xs">
                    <label htmlFor="signup-name" className="font-bold text-gray-700 uppercase tracking-wider block">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        id="signup-name"
                        type="text"
                        required
                        placeholder="e.g. Alexander Mercer"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-sand-dark border border-gray-150 rounded-xl py-2.5 pl-9 pr-3 text-forest focus:outline-none focus:ring-1 focus:ring-forest text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label htmlFor="signup-email" className="font-bold text-gray-700 uppercase tracking-wider block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        id="signup-email"
                        type="email"
                        required
                        placeholder="e.g. contact@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-sand-dark border border-gray-150 rounded-xl py-2.5 pl-9 pr-3 text-forest focus:outline-none focus:ring-1 focus:ring-forest text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label htmlFor="signup-password" className="font-bold text-gray-700 uppercase tracking-wider">
                        Password
                      </label>
                      <input
                        id="signup-password"
                        type="password"
                        required
                        placeholder="At least 6 chars"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-sand-dark border border-gray-150 rounded-xl py-2.5 px-3 text-forest focus:outline-none focus:ring-1 focus:ring-forest text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="signup-confirm" className="font-bold text-gray-700 uppercase tracking-wider">
                        Confirm
                      </label>
                      <input
                        id="signup-confirm"
                        type="password"
                        required
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-sand-dark border border-gray-150 rounded-xl py-2.5 px-3 text-forest focus:outline-none focus:ring-1 focus:ring-forest text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-forest hover:bg-forest-light text-lime font-bold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm mt-2 disabled:opacity-80"
                  >
                    <span>{loading ? "Registering account..." : "Complete Registration"}</span>
                    {!loading && <ArrowRight size={14} />}
                  </button>
                </form>
              )}

              {/* 3. FORGOTTEN PASSWORD SCREEN */}
              {screen === "forgotten" && (
                <form onSubmit={handleForgottenPassword} className="space-y-4">
                  <div className="space-y-1 text-xs">
                    <label htmlFor="forgotten-email" className="font-bold text-gray-700 uppercase tracking-wider block">
                      Account Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        id="forgotten-email"
                        type="email"
                        required
                        placeholder="Enter your registered email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-sand-dark border border-gray-150 rounded-xl py-2.5 pl-9 pr-3 text-forest focus:outline-none focus:ring-1 focus:ring-forest text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-forest hover:bg-forest-light text-lime font-bold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm disabled:opacity-80"
                  >
                    <span>{loading ? "Validating Account..." : "Authorize Password Reset"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreen("login")}
                    className="w-full py-1 text-center font-bold text-xs text-gray-500 hover:text-forest flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <ArrowLeft size={12} />
                    <span>Back to login screen</span>
                  </button>
                </form>
              )}

              {/* 4. CREATE NEW PASSWORD SCREEN */}
              {screen === "reset" && (
                <form onSubmit={handleCreateNewPassword} className="space-y-4">
                  <div className="space-y-1 text-xs">
                    <label htmlFor="create-new-password" className="font-bold text-gray-700 uppercase tracking-wider block">
                      create new password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        id="create-new-password"
                        type="password"
                        required
                        placeholder="Choose a strong new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-sand-dark border border-gray-150 rounded-xl py-2.5 pl-9 pr-3 text-forest focus:outline-none focus:ring-1 focus:ring-forest text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-forest hover:bg-forest-light text-lime font-bold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm disabled:opacity-80"
                  >
                    <span>{loading ? "Updating Account..." : "Confirm & Save Password"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setScreen("login");
                      setSuccess("");
                    }}
                    className="w-full py-1 text-center font-bold text-xs text-gray-500 hover:text-forest flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <ArrowLeft size={12} />
                    <span>Return to Login</span>
                  </button>
                </form>
              )}

              {/* Divider line */}
              {screen !== "reset" && (
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[10px] uppercase font-bold text-gray-400">or use secure provider</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
              )}

              {/* Google Sign In action */}
              {screen !== "reset" && (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full border border-gray-250 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2.5 transition-all cursor-pointer shadow-inner"
                >
                  <Chrome className="text-red-500" size={15} />
                  <span>Continue with Google Account</span>
                </button>
              )}

              {/* Alternate Toggle footer (login/signup) */}
              {screen === "login" && (
                <p className="text-center text-xs text-gray-500 font-medium">
                  Don't have a secure Gysm account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setScreen("signup");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-forest font-bold hover:underline"
                  >
                    login/signup
                  </button>
                </p>
              )}

              {screen === "signup" && (
                <p className="text-center text-xs text-gray-500 font-medium">
                  Already registered on gysm.io?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setScreen("login");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-forest font-bold hover:underline"
                  >
                    Sign In Instead
                  </button>
                </p>
              )}
            </>
          )}

        </div>
      </div>

      {/* Footer credits info */}
      <div className="w-full text-center py-6 text-xs text-gray-400 font-sans border-t border-gray-150 flex flex-col items-center gap-1">
        <p>© {new Date().getFullYear()} Gysm. Safe sandbox secure encryption. Built with Google AI Studio.</p>
        <p>
          <button 
            type="button" 
            onClick={() => {
              window.history.pushState(null, "", "/privacy-policy");
              window.dispatchEvent(new Event("popstate"));
            }} 
            className="text-forest hover:underline font-semibold cursor-pointer"
          >
            Privacy &amp; Data Protection Policy
          </button>
        </p>
      </div>

    </div>
  );
}
