import { useEffect, useRef, useState } from "react";
import { MicrosoftLogo } from "./Logo";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { api } from "../../lib/api";
import type { UserProfile } from "../../lib/cbs-data";

type Stage = "pick" | "create" | "password" | "verifying";

const ACCOUNTS = [
  { email: "demo.student@cbs-mail.de", name: "Demo Student" },
  { email: "lena.hoffmann@cbs-mail.de", name: "Lena Hoffmann" },
];

function deriveName(email: string): string {
  const local = email.split("@")[0] ?? "";
  return local
    .split(/[._-]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function getRecoveryHint(email: string): string {
  const lower = email.toLowerCase();
  if (lower.includes("demo")) {
    return "Demo Environment Shield: Account recovery bypass active. Use password 'demo2026' to sign in successfully.";
  }
  if (lower === "lena.hoffmann@cbs-mail.de") {
    return "Demo Environment Shield: Lena Hoffmann recovery key found. Use password 'cbs2026' to sign in successfully.";
  }
  return "Hint: Use your registered account password, or try 'demo2026' for demo accounts.";
}

export function MicrosoftAuthModal({
  open,
  onClose,
  onAuthenticated,
  onCreateAccount,
}: {
  open: boolean;
  onClose: () => void;
  /** profile is non-null when the user has a saved profile — App skips onboarding */
  onAuthenticated: (email: string, name: string, profile: UserProfile | null) => void;
  onCreateAccount: (email: string) => void;
}) {
  const [stage, setStage] = useState<Stage>("pick");

  // pick state
  const [customExpanded, setCustomExpanded] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customEmailError, setCustomEmailError] = useState("");

  // create-account state
  const [newEmail, setNewEmail] = useState("");
  const [newEmailError, setNewEmailError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  // password-sign-in state
  const [chosenEmail, setChosenEmail] = useState("");
  const [chosenName, setChosenName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [recoveryHint, setRecoveryHint] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const customInputRef = useRef<HTMLInputElement>(null);
  const newEmailRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // ── Full reset whenever modal opens ──────────────────────────────────────
  useEffect(() => {
    if (open) {
      setStage("pick");
      setCustomExpanded(false);
      setCustomEmail(""); setCustomEmailError("");
      setNewEmail(""); setNewEmailError("");
      setNewPassword(""); setNewPasswordError(""); setNewPasswordVisible(false);
      setCreating(false);
      setChosenEmail(""); setChosenName("");
      setPassword(""); setPasswordVisible(false);
      setPasswordError(""); setRecoveryHint(null);
      setValidating(false);
    }
  }, [open]);

  useEffect(() => {
    if (customExpanded) setTimeout(() => customInputRef.current?.focus(), 50);
  }, [customExpanded]);

  useEffect(() => {
    if (stage === "create")   setTimeout(() => newEmailRef.current?.focus(), 50);
    if (stage === "password") setTimeout(() => passwordInputRef.current?.focus(), 50);
  }, [stage]);

  if (!open) return null;

  // ── Handlers ─────────────────────────────────────────────────────────────

  function selectPreset(email: string, name: string) {
    setChosenEmail(email); setChosenName(name);
    setPassword(""); setPasswordError(""); setRecoveryHint(null);
    setStage("password");
  }

  function submitCustomEmail() {
    const v = customEmail.trim().toLowerCase();
    if (!v) { setCustomEmailError("Please enter your CBS email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setCustomEmailError("Enter a valid email address."); return; }
    setCustomEmailError("");
    setChosenEmail(v); setChosenName(deriveName(v));
    setPassword(""); setPasswordError(""); setRecoveryHint(null);
    setStage("password");
  }

  function openCreateForm() {
    const seed = customEmail.trim().toLowerCase();
    setNewEmail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(seed) ? seed : "");
    setNewEmailError(""); setNewPassword(""); setNewPasswordError("");
    setCreating(false);
    setStage("create");
  }

  async function submitCreateAccount() {
    const emailVal = newEmail.trim().toLowerCase();
    let hasError = false;

    if (!emailVal) {
      setNewEmailError("Enter your new CBS email address."); hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setNewEmailError("Enter a valid email address."); hasError = true;
    } else {
      setNewEmailError("");
    }

    if (!newPassword) {
      setNewPasswordError("Create a password to continue."); hasError = true;
    } else if (newPassword.length < 6) {
      setNewPasswordError("Password must be at least 6 characters."); hasError = true;
    } else {
      setNewPasswordError("");
    }

    if (hasError) return;

    const name = deriveName(emailVal);
    setCreating(true);
    try {
      await api.auth.register(emailVal, name, newPassword);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("409")) {
        setNewEmailError("This email is already registered. Sign in instead.");
      } else {
        setNewEmailError("Registration failed. Please try again.");
      }
      setCreating(false);
      return;
    }

    onCreateAccount(emailVal);
  }

  async function submitPassword() {
    if (!password) { setPasswordError("Enter your password."); return; }

    setValidating(true);
    setPasswordError("");
    try {
      const result = await api.auth.validate(chosenEmail, password);
      if (!result.valid) {
        setPasswordError("Incorrect password. Click 'Forgot password?' for a hint.");
        setValidating(false);
        return;
      }
      const resolvedName = result.name ?? chosenName;
      const savedProfile = result.profile ?? null;
      setChosenName(resolvedName);
      setRecoveryHint(null);
      setStage("verifying");
      setTimeout(() => onAuthenticated(chosenEmail, resolvedName, savedProfile), 1600);
    } catch {
      setPasswordError("Could not reach the server. Please try again.");
      setValidating(false);
    }
  }

  function handleForgotPassword() {
    setRecoveryHint(getRecoveryHint(chosenEmail));
    setPasswordError("");
  }

  function backToPick() {
    setStage("pick");
    setCustomExpanded(false); setCustomEmail(""); setCustomEmailError("");
    setPassword(""); setPasswordError(""); setRecoveryHint(null);
    setValidating(false);
  }

  const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="w-full max-w-[440px] overflow-hidden rounded-sm bg-white shadow-2xl animate-scale-in">

        {/* Header */}
        <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-6 pt-5 pb-4">
          <MicrosoftLogo size={22} />
          <span className="text-[15px] font-semibold text-[#1b1b1b]">Microsoft</span>
        </div>

        <div className="px-12 py-8">

          {/* ─── STAGE: pick ─────────────────────────────────────────────── */}
          {stage === "pick" && (
            <>
              <h2 className="text-[22px] font-semibold text-[#1b1b1b]">Pick an account</h2>
              <div className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200">
                {ACCOUNTS.map((a) => (
                  <button
                    key={a.email}
                    onClick={() => selectPreset(a.email, a.name)}
                    className="flex w-full items-center gap-3 px-2 py-3 text-left transition-colors hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0078d4] text-sm font-semibold text-white">
                      {initials(a.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-[#1b1b1b]">{a.email}</div>
                      <div className="text-[12px] text-gray-500">Signed in to Cologne Business School</div>
                    </div>
                    <span className="shrink-0 text-[15px] text-gray-400">›</span>
                  </button>
                ))}

                {/* "Use another account" inline expand */}
                <div>
                  <button
                    onClick={() => setCustomExpanded((v) => !v)}
                    className="flex w-full items-center gap-3 px-2 py-3 text-left transition-colors hover:bg-gray-50 focus:outline-none"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-300 text-[18px] leading-none text-gray-500 transition-transform duration-200"
                      style={{ transform: customExpanded ? "rotate(45deg)" : "rotate(0deg)" }}
                    >+</div>
                    <span className="text-[13px] text-[#1b1b1b]">Use another account</span>
                  </button>

                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: customExpanded ? "200px" : "0px", opacity: customExpanded ? 1 : 0 }}
                  >
                    <div className="px-2 pb-3 pt-1">
                      <input
                        ref={customInputRef}
                        type="email"
                        value={customEmail}
                        onChange={(e) => { setCustomEmail(e.target.value); setCustomEmailError(""); }}
                        onKeyDown={(e) => { if (e.key === "Enter") submitCustomEmail(); if (e.key === "Escape") setCustomExpanded(false); }}
                        placeholder="name.surname@cbs-mail.de"
                        className="w-full rounded-sm border border-gray-300 px-3 py-2 text-[13px] text-[#1b1b1b] placeholder:text-gray-400 outline-none transition focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4]/30"
                      />
                      {customEmailError && <p className="mt-1 text-[11px] text-red-600">{customEmailError}</p>}
                      <button
                        onClick={openCreateForm}
                        className="mt-2 block text-[12px] text-[#0067b8] hover:underline focus:outline-none"
                      >
                        No account? <span className="font-semibold">Create one!</span>
                      </button>
                      <button
                        onClick={submitCustomEmail}
                        className="mt-2 rounded-sm bg-[#0078d4] px-4 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#006cbe]"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-[12px] text-gray-500">
                Cologne Business School uses Microsoft 365 for authentication. By continuing you agree to the CBS Acceptable Use Policy.
              </p>
              <button onClick={onClose} className="mt-4 text-[12px] text-[#0067b8] hover:underline">
                Back to TeamUp
              </button>
            </>
          )}

          {/* ─── STAGE: create ───────────────────────────────────────────── */}
          {stage === "create" && (
            <>
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0078d4]">
                  <span className="text-[15px] font-bold text-white">M</span>
                </div>
                <span className="text-[13px] font-semibold text-[#1b1b1b]">Create account</span>
              </div>
              <p className="mb-5 text-[12px] text-gray-500">
                Use your Cologne Business School email address to register with TeamUp.
              </p>

              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-[#1b1b1b]">Create email</label>
                <input
                  ref={newEmailRef}
                  type="email"
                  value={newEmail}
                  onChange={(e) => { setNewEmail(e.target.value); setNewEmailError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") void submitCreateAccount(); }}
                  placeholder="name.surname@cbs-mail.de"
                  disabled={creating}
                  className="w-full rounded-sm border border-gray-300 px-3 py-2 text-[13px] text-[#1b1b1b] placeholder:text-gray-400 outline-none transition focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4]/30 disabled:opacity-60"
                />
                {newEmailError && <p className="text-[11px] text-red-600">{newEmailError}</p>}
              </div>

              <div className="mt-4 space-y-1">
                <label className="block text-[12px] font-semibold text-[#1b1b1b]">Create password</label>
                <div className="relative">
                  <input
                    type={newPasswordVisible ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setNewPasswordError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") void submitCreateAccount(); }}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    disabled={creating}
                    className="w-full rounded-sm border border-gray-300 px-3 py-2 pr-10 text-[13px] text-[#1b1b1b] placeholder:text-gray-400 outline-none transition focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4]/30 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setNewPasswordVisible((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {newPasswordVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {newPasswordError && <p className="text-[11px] text-red-600">{newPasswordError}</p>}
              </div>

              <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
                By clicking Next, you agree to the Microsoft Services Agreement and CBS Acceptable Use Policy.
              </p>

              <button
                onClick={() => void submitCreateAccount()}
                disabled={creating}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-sm bg-[#0078d4] py-2 text-[13px] font-semibold text-white transition hover:bg-[#006cbe] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0078d4]/40 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {creating && <Loader2 size={14} className="animate-spin" />}
                {creating ? "Creating account…" : "Next"}
              </button>

              <button
                onClick={backToPick}
                disabled={creating}
                className="mt-4 text-[12px] text-[#0067b8] hover:underline disabled:opacity-50"
              >
                ← Back to sign in
              </button>
            </>
          )}

          {/* ─── STAGE: password ─────────────────────────────────────────── */}
          {stage === "password" && (
            <>
              <div className="flex flex-col items-center gap-3 pb-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0078d4] text-xl font-bold text-white">
                  {initials(chosenName)}
                </div>
                <div className="text-center">
                  <div className="text-[14px] font-semibold text-[#1b1b1b]">{chosenName}</div>
                  <div className="text-[12px] text-gray-500">{chosenEmail}</div>
                </div>
              </div>

              <p className="mt-5 text-[13px] font-medium text-[#1b1b1b]">Enter password</p>

              <div className="relative mt-2">
                <input
                  ref={passwordInputRef}
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(""); if (recoveryHint) setRecoveryHint(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter") void submitPassword(); }}
                  placeholder="Password"
                  autoComplete="current-password"
                  disabled={validating}
                  className="w-full rounded-sm border border-gray-300 px-3 py-2 pr-10 text-[13px] text-[#1b1b1b] placeholder:text-gray-400 outline-none transition focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4]/30 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {passwordVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {passwordError && <p className="mt-1.5 text-[12px] text-red-600">{passwordError}</p>}

              {recoveryHint && (
                <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <span className="mt-px shrink-0 text-[13px]">🔧</span>
                  <p className="flex-1 text-[12px] leading-relaxed text-amber-800">{recoveryHint}</p>
                  <button onClick={() => setRecoveryHint(null)} className="ml-1 shrink-0 text-amber-500 hover:text-amber-700" tabIndex={-1}>
                    <X size={13} />
                  </button>
                </div>
              )}

              <button
                onClick={() => void submitPassword()}
                disabled={validating}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-sm bg-[#0078d4] py-2 text-[13px] font-semibold text-white transition hover:bg-[#006cbe] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0078d4]/40 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {validating && <Loader2 size={14} className="animate-spin" />}
                {validating ? "Checking…" : "Sign in"}
              </button>

              <div className="mt-4 flex items-center justify-between">
                <button onClick={backToPick} disabled={validating} className="text-[12px] text-[#0067b8] hover:underline disabled:opacity-50">← Back</button>
                <button onClick={handleForgotPassword} disabled={validating} className="text-[12px] text-[#0067b8] hover:underline disabled:opacity-50">Forgot password?</button>
              </div>
            </>
          )}

          {/* ─── STAGE: verifying ────────────────────────────────────────── */}
          {stage === "verifying" && (
            <div className="py-6 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#0078d4]" />
              <h3 className="mt-5 text-[18px] font-semibold text-[#1b1b1b]">
                Verifying CBS Credentials via Azure…
              </h3>
              <p className="mt-2 text-[13px] text-gray-500">{chosenEmail}</p>
              <div className="mt-6 space-y-1.5 text-left text-[12px] text-gray-500">
                <div className="flex items-center gap-2"><span className="text-green-600">✓</span> Connected to login.microsoftonline.com</div>
                <div className="flex items-center gap-2"><span className="text-green-600">✓</span> Validated cbs-mail.de tenant</div>
                <div className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Issuing SSO token…</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 text-right text-[11px] text-gray-400">
          © Microsoft 2026 · Cologne Business School tenant
        </div>
      </div>
    </div>
  );
}
