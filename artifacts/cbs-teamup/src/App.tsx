import { useEffect, useMemo, useRef, useState } from "react";
import { Landing } from "@/components/cbs/Landing";
import { MicrosoftAuthModal } from "@/components/cbs/MicrosoftAuthModal";
import { Onboarding } from "@/components/cbs/Onboarding";
import { Dashboard } from "@/components/cbs/Dashboard";
import { MatchingOverlay } from "@/components/cbs/MatchingOverlay";
import { MOCK_STUDENTS, matchTeam, type UserProfile } from "@/lib/cbs-data";
import { api } from "@/lib/api";

type Phase = "landing" | "onboarding" | "dashboard" | "matching" | "loading";

export default function App() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [authOpen, setAuthOpen] = useState(false);
  const [auth, setAuth] = useState<{ name: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasMatched, setHasMatched] = useState(false);

  // Guard: session-check runs exactly once on mount
  const sessionChecked = useRef(false);

  const team = useMemo(
    () => (profile ? matchTeam(profile, MOCK_STUDENTS) : []),
    [profile]
  );

  // ── Session restore ────────────────────────────────────────────────────────
  useEffect(() => {
    if (sessionChecked.current) return;
    sessionChecked.current = true;

    api.auth.session()
      .then((session) => {
        if (session.active && session.profile) {
          setAuth({ email: session.email, name: session.name });
          setProfile(session.profile);
          setPhase("dashboard");
        } else if (session.active && !session.profile) {
          setAuth({ email: session.email, name: session.name });
          setPhase("onboarding");
        } else {
          setPhase("landing");
        }
      })
      .catch(() => {
        setPhase("landing");
      });
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleLogoHome() {
    setPhase("landing");
  }

  function handleLogout() {
    api.auth.logout().catch(() => {});
    setHasMatched(false);
    setProfile(null);
    setAuth(null);
    setAuthOpen(false);
    setPhase("landing");
  }

  /**
   * Called after the password modal validates credentials.
   * If the backend returned a saved profile, skip onboarding entirely.
   */
  function handleAuthenticated(email: string, name: string, savedProfile: UserProfile | null) {
    setAuth({ email, name });
    setAuthOpen(false);
    // Fire login to establish/refresh the session (includes profile if present)
    api.auth.login(email, name).catch(() => {});
    if (savedProfile) {
      setProfile(savedProfile);
      setPhase("dashboard");
    } else {
      setProfile(null);
      setPhase("onboarding");
    }
  }

  function handleCreateAccount(email: string) {
    const name = email
      ? email.split("@")[0].split(/[._-]/).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ")
      : "New Student";
    const resolvedEmail = email || `student.${Date.now()}@cbs-mail.de`;
    setHasMatched(false);
    setProfile(null);
    setAuth({ email: resolvedEmail, name });
    setAuthOpen(false);
    api.auth.login(resolvedEmail, name).catch(() => {});
    setPhase("onboarding");
  }

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="text-sm text-muted-foreground">Restoring session…</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {phase === "landing" && (
        <Landing
          onSignIn={() => setAuthOpen(true)}
          profile={profile}
          onReturnToDashboard={() => setPhase("dashboard")}
        />
      )}

      {phase === "onboarding" && auth && (
        <Onboarding
          name={auth.name}
          email={auth.email}
          onComplete={(p) => {
            setProfile(p);
            // Save to session (for current reload recovery)
            api.auth.saveProfile(p).catch(() => {});
            // Save to durable profiles map (survives future logout/login cycles)
            api.auth.updatePreferences(auth.email, p).catch(() => {});
            setPhase("dashboard");
          }}
          onBack={() => {
            api.auth.logout().catch(() => {});
            setAuth(null);
            setPhase("landing");
          }}
        />
      )}

      {phase === "dashboard" && profile && (
        <Dashboard
          user={profile}
          team={hasMatched ? team : null}
          onMatch={() => setPhase("matching")}
          onGoHome={handleLogoHome}
          onLogout={handleLogout}
        />
      )}

      {phase === "matching" && (
        <MatchingOverlay
          onDone={() => { setHasMatched(true); setPhase("dashboard"); }}
        />
      )}

      {/* Modal is always rendered so it stays reachable, but its internal
          state is fully reset via useEffect whenever `open` flips to true */}
      <MicrosoftAuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={handleAuthenticated}
        onCreateAccount={handleCreateAccount}
      />
    </>
  );
}
