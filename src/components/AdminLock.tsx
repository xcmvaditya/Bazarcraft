import React, { useState } from "react";
import { KeyRound, Eye, EyeOff, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";

interface AdminLockProps {
  onUnlock: () => void;
  onBackToStorefront: () => void;
  savedPassword: string;
}

export default function AdminLock({ onUnlock, onBackToStorefront, savedPassword }: AdminLockProps) {
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === savedPassword) {
      setErrorMsg("");
      onUnlock();
    } else {
      setErrorMsg("Galat password! Kripya sahi password enter karein.");
      // Auto shake feedback could be nice, or simple clean message
    }
  };

  return (
    <div 
      id="admin-lock-screen" 
      className="min-h-[calc(100vh-80px)] bg-slate-950 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
    >
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/50 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-md relative z-10 space-y-6 shadow-2xl">
        {/* Shield Icon / Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-amber-500" />
          </div>
          <h2 className="text-xl font-sans font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
            Admin Console Locked <Sparkles className="w-4 h-4 text-amber-500" />
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
            Yeh section password protected hai. Kripya admin access verify karein.
          </p>
        </div>

        {/* Access Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Console Passcode / Password
            </label>
            <div className="relative">
              <input
                id="admin-passcode-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password (default: admin123)"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMsg("");
                }}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500/80 rounded-xl pl-4 pr-11 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-400 font-medium font-sans animate-pulse pt-1">
                ⚠️ {errorMsg}
              </p>
            )}
          </div>

          <button
            id="admin-unlock-submit-btn"
            type="submit"
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-sans font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10"
          >
            <ShieldCheck className="w-4 h-4" />
            Verify and Open Console
          </button>
        </form>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-800/60 flex justify-center">
          <button
            onClick={onBackToStorefront}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Wapas Storefront par jayein
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-[10px] font-mono text-slate-600 max-w-xs leading-normal">
        * Tip: Default security code is <span className="text-amber-500/80 font-bold">admin123</span>. Isse aap console me change bhi kar sakte hain.
      </div>
    </div>
  );
}
