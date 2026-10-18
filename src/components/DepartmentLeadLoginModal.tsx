import React, { useState } from "react";
import {
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  UserCheck,
  Building,
  ArrowRight,
  LogOut,
  Sparkles,
} from "lucide-react";

export type DepartmentCredential = {
  id: string;
  departmentCode: string;
  departmentName: string;
  leadName: string;
  email: string;
  password: string;
  roleTitle: string;
  badgeTone: string;
};

export const DEPARTMENT_CREDENTIALS: DepartmentCredential[] = [
  {
    id: "pur",
    departmentCode: "PUR",
    departmentName: "Purchasing & Supply Chain Management",
    leadName: "Morgan Reed",
    email: "morgan.reed@example.com",
    password: "Demo@PUR2026",
    roleTitle: "Purchasing & SCM Lead",
    badgeTone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  {
    id: "sales",
    departmentCode: "SAL",
    departmentName: "Sales & Business Development",
    leadName: "Priya Sharma",
    email: "priya.sharma@example.com",
    password: "Demo@SAL2026",
    roleTitle: "Sales & BD Lead",
    badgeTone: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  {
    id: "fin",
    departmentCode: "FIN",
    departmentName: "Accounts & Finance",
    leadName: "Priya Voss",
    email: "priya.voss@example.com",
    password: "Demo@FIN2026",
    roleTitle: "Finance & Accounts Lead",
    badgeTone: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  {
    id: "ehw",
    departmentCode: "EHW",
    departmentName: "Embedded Hardware Engineering",
    leadName: "Avery Vale",
    email: "avery.vale@example.com",
    password: "Demo@EHW2026",
    roleTitle: "Hardware Engineering Lead",
    badgeTone: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
  },
  {
    id: "qa",
    departmentCode: "QA",
    departmentName: "Quality Assurance & APQP",
    leadName: "Jordan Blake",
    email: "jordan.blake@example.com",
    password: "Demo@QA2026",
    roleTitle: "QA & APQP Lead",
    badgeTone: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  },
  {
    id: "esw",
    departmentCode: "ESW",
    departmentName: "Firmware & Software",
    leadName: "Devon Lane",
    email: "devon.lane@example.com",
    password: "Demo@ESW2026",
    roleTitle: "Firmware & SW Lead",
    badgeTone: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  },
  {
    id: "mech",
    departmentCode: "MECH",
    departmentName: "Mechanical Engineering",
    leadName: "Samira Holt",
    email: "samira.holt@example.com",
    password: "Demo@MECH2026",
    roleTitle: "Mechanical Engineering Lead",
    badgeTone: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30",
  },
  {
    id: "emf",
    departmentCode: "EMF",
    departmentName: "Electronics & Mechanical Manufacturing",
    leadName: "Casey Rowan",
    email: "casey.rowan@example.com",
    password: "Demo@EMF2026",
    roleTitle: "Manufacturing Lead",
    badgeTone: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  },
  {
    id: "tst",
    departmentCode: "TST",
    departmentName: "Production & Automated EOL Testing",
    leadName: "Mina Cross",
    email: "mina.cross@example.com",
    password: "Demo@TST2026",
    roleTitle: "Testing & EOL Lead",
    badgeTone: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  },
  {
    id: "admin",
    departmentCode: "ADMIN",
    departmentName: "Executive Administration & MD",
    leadName: "Executive Admin",
    email: "admin@example.com",
    password: "Admin@Demo2026",
    roleTitle: "Managing Director / Admin",
    badgeTone: "bg-primary/15 text-primary border-primary/30",
  },
  {
    id: "client",
    departmentCode: "OEM",
    departmentName: "Tata Motors Fleet Solutions",
    leadName: "Rohan Verma",
    email: "rohan.verma@tatamotors.com",
    password: "Tata@Client2026",
    roleTitle: "Tata Motors Fleet Operations Manager",
    badgeTone: "bg-blue-600/15 text-blue-700 dark:text-blue-300 border-blue-600/30",
  },
];

export type DepartmentLeadLoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentPersonaId: string;
  onLoginSuccess: (personaId: string, leadInfo: DepartmentCredential) => void;
  onLogout: () => void;
};

export function DepartmentLeadLoginModal({
  isOpen,
  onClose,
  currentPersonaId,
  onLoginSuccess,
  onLogout,
}: DepartmentLeadLoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeCred = DEPARTMENT_CREDENTIALS.find((c) => c.id === currentPersonaId);

  const handleAutofill = (cred: DepartmentCredential) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setErrorMessage(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    const matched = DEPARTMENT_CREDENTIALS.find(
      (c) =>
        (c.email.toLowerCase() === trimmedEmail ||
          c.id.toLowerCase() === trimmedEmail ||
          c.departmentCode.toLowerCase() === trimmedEmail) &&
        c.password === trimmedPass
    );

    if (matched) {
      setSuccessMessage(`Authenticated successfully as ${matched.leadName} (${matched.roleTitle})`);
      setTimeout(() => {
        onLoginSuccess(matched.id, matched);
        setSuccessMessage(null);
        onClose();
      }, 400);
    } else {
      setErrorMessage("Authentication failed: Invalid work email or password for this department lead.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden text-card-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Lock className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  Department Lead Authentication & Access Control
                </h3>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  IATF 16949 / ISO 27001
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sign in with official department credentials to access role-governed workspaces.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-6">
          {/* If already signed in as a department lead (non-admin), show locked session card only */}
          {activeCred && currentPersonaId !== "admin" ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="rounded-xl border border-border/80 bg-secondary/30 p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="grid size-12 place-items-center rounded-xl bg-primary/15 text-primary font-bold font-mono text-sm border border-primary/20">
                      {activeCred.departmentCode}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-foreground">
                          {activeCred.leadName}
                        </h4>
                        <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${activeCred.badgeTone}`}>
                          {activeCred.id === "client" ? "OEM Client" : `${activeCred.departmentCode} Lead`}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {activeCred.email}
                      </p>
                      <p className="text-xs text-foreground font-medium mt-1">
                        {activeCred.departmentName}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Active Session
                  </span>
                </div>

                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="size-4 shrink-0 text-amber-500" />
                    <span>IATF 16949 / ISO 27001 Access Control Enforced</span>
                  </div>
                  <p className="leading-relaxed">
                    You are authenticated as <strong>{activeCred.leadName}</strong> ({activeCred.departmentName}).
                    To guarantee data integrity and prevent unauthorized modifications, switching to Executive Admin or other roles is locked. Only your authorized workspace and deliverables are accessible.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Session ID: HLPL-SESS-{activeCred.departmentCode}-2026
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setEmail("");
                      setPassword("");
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/15 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/25 transition-colors shadow-xs"
                  >
                    <LogOut className="size-4" />
                    <span>Sign Out of {activeCred.id === "client" ? "OEM Client" : `${activeCred.departmentCode} Lead`} Session</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Need to switch to another lead or Executive Admin? Click <strong>Sign Out</strong> above to terminate your current session and return to the login gateway.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Active Admin Session (if logged in as admin) */}
              {activeCred && currentPersonaId === "admin" && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-secondary/30 p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary font-bold font-mono text-xs">
                      {activeCred.departmentCode}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          Active User: {activeCred.leadName}
                        </span>
                        <span className={`rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase ${activeCred.badgeTone}`}>
                          {activeCred.departmentCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {activeCred.email} · {activeCred.departmentName}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setEmail("");
                      setPassword("");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <LogOut className="size-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium animate-in fade-in duration-150">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in duration-150">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">
                    Work Email Address / Department Username
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. morgan.reed@example.com"
                      className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-foreground">
                      Access Password
                    </label>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Standard format: Demo@[DEPT]2026
                    </span>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="size-4" />
                  <span>Authenticate & Sign In as Department Lead</span>
                  <ArrowRight className="size-4" />
                </button>
              </form>

              {/* Quick-Autofill Credentials Roster (Visible to Admin or Unauthenticated users only) */}
              <div className="pt-2 border-t border-border/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Sparkles className="size-3.5 text-amber-500" />
                    <span>Department Lead Credentials Roster (Sign-in Directory)</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Select a department lead to sign in
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {DEPARTMENT_CREDENTIALS.map((cred) => (
                    <button
                      key={cred.id}
                      type="button"
                      onClick={() => handleAutofill(cred)}
                      className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all hover:border-primary/50 hover:bg-accent/40 ${
                        email.toLowerCase() === cred.email.toLowerCase()
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border/80 bg-card/60"
                      }`}
                    >
                      <span className={`grid size-7 shrink-0 place-items-center rounded-md font-mono text-[10px] font-bold border ${cred.badgeTone}`}>
                        {cred.departmentCode}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-foreground truncate">{cred.leadName}</span>
                          <span className="font-mono text-[9px] text-muted-foreground">{cred.departmentCode}</span>
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground truncate">{cred.email}</p>
                        <p className="font-mono text-[9px] text-primary/80 font-medium mt-0.5">Password: {cred.password}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
