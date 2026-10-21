import React, { useState } from "react";
import {
  User,
  FileText,
  ShieldCheck,
  GraduationCap,
  ClipboardList,
  Laptop,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Check,
  Award,
  Calendar,
  Building,
  KeyRound,
  FileCheck2,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  type EmployeeProfile,
  type EmployeeLetter,
  type AssignedPolicy,
  type AssignedTraining,
  type AssignedFormSurvey,
  type EmployeeAssignedAsset,
  DEFAULT_EMPLOYEE_PROFILES,
  DEFAULT_EMPLOYEE_LETTERS,
  DEFAULT_ASSIGNED_POLICIES,
  DEFAULT_ASSIGNED_TRAININGS,
  DEFAULT_ASSIGNED_FORMS,
  DEFAULT_EMPLOYEE_ASSETS,
} from "@/lib/employee-services";
import type { Persona } from "@/components/RoleAwareSidebar";

interface EmployeeSelfServiceWorkspaceProps {
  persona: Persona;
}

export function EmployeeSelfServiceWorkspace({ persona }: EmployeeSelfServiceWorkspaceProps) {
  // Resolve profile based on persona email or fallback
  const userEmail = persona.person.toLowerCase().includes("avery")
    ? "avery.vale@example.com"
    : persona.person.toLowerCase().includes("priya sharma")
    ? "priya.sharma@example.com"
    : persona.person.toLowerCase().includes("jordan")
    ? "jordan.blake@example.com"
    : persona.person.toLowerCase().includes("morgan")
    ? "morgan.reed@example.com"
    : "admin@example.com";

  const profile: EmployeeProfile =
    DEFAULT_EMPLOYEE_PROFILES[userEmail] || DEFAULT_EMPLOYEE_PROFILES["admin@example.com"];

  const [activeTab, setActiveTab] = useState<
    "details" | "letters" | "policies" | "training" | "forms" | "assets"
  >("details");

  const [letters, setLetters] = useState<EmployeeLetter[]>(DEFAULT_EMPLOYEE_LETTERS);
  const [policies, setPolicies] = useState<AssignedPolicy[]>(DEFAULT_ASSIGNED_POLICIES);
  const [trainings, setTrainings] = useState<AssignedTraining[]>(DEFAULT_ASSIGNED_TRAININGS);
  const [forms, setForms] = useState<AssignedFormSurvey[]>(DEFAULT_ASSIGNED_FORMS);
  const [assets, setAssets] = useState<EmployeeAssignedAsset[]>(DEFAULT_EMPLOYEE_ASSETS);

  // Modal State for Letter / Policy / Quiz
  const [selectedLetter, setSelectedLetter] = useState<EmployeeLetter | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<AssignedPolicy | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<AssignedTraining | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Acknowledge Policy
  const handleAcknowledgePolicy = (policyId: string) => {
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === policyId
          ? { ...p, status: "Acknowledged", acknowledgedAt: new Date().toISOString() }
          : p
      )
    );
    setSelectedPolicy(null);
    setNoticeMessage(`Policy revision successfully acknowledged and bound to your employee record.`);
  };

  // Submit Quiz
  const handleSubmitQuiz = (trainingId: string) => {
    const training = trainings.find((t) => t.id === trainingId);
    if (!training) return;

    let correctCount = 0;
    training.quizQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / training.quizQuestions.length) * 100);

    setTrainings((prev) =>
      prev.map((t) =>
        t.id === trainingId
          ? {
              ...t,
              status: scorePct >= 80 ? "Completed" : "In_Progress",
              scorePct,
              completedAt: new Date().toISOString(),
              certificateRef: scorePct >= 80 ? `CERT-${Date.now().toString().slice(-4)}` : undefined,
            }
          : t
      )
    );
    setQuizSubmitted(true);
    setNoticeMessage(`Assessment completed with score: ${scorePct}%. Training status updated.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Employee Self-Service (ESS)
            </span>
            <span className="text-xs text-muted-foreground">{profile.employeeCode}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground mt-1">
            My Profile & Personnel Records
          </h2>
          <p className="text-xs text-muted-foreground">
            Personal employment details, issued letters, assigned policies, training assessments, surveys, and assigned equipment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-foreground">{profile.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono">({profile.departmentCode})</span>
          </div>
        </div>
      </div>

      {noticeMessage && (
        <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{noticeMessage}</span>
          </div>
          <button onClick={() => setNoticeMessage(null)} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg border border-border/50 overflow-x-auto">
        <button
          onClick={() => setActiveTab("details")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === "details" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          My Details
        </button>
        <button
          onClick={() => setActiveTab("letters")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === "letters" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          My Letters ({letters.length})
        </button>
        <button
          onClick={() => setActiveTab("policies")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === "policies" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          My Policies ({policies.filter((p) => p.status === "Pending").length} Pending)
        </button>
        <button
          onClick={() => setActiveTab("training")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === "training" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          My Training & Quizzes ({trainings.length})
        </button>
        <button
          onClick={() => setActiveTab("forms")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === "forms" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          Forms & Surveys ({forms.length})
        </button>
        <button
          onClick={() => setActiveTab("assets")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === "assets" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          My Equipment & Assets ({assets.length})
        </button>
      </div>

      {/* Details View */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Verified Employment Profile
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Full Name</span>
                <span className="font-semibold text-foreground text-sm">{profile.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Employee Code</span>
                <span className="font-mono font-semibold text-foreground">{profile.employeeCode}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Department</span>
                <span className="font-semibold text-foreground">{profile.departmentName} ({profile.departmentCode})</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Role / Designation</span>
                <span className="font-semibold text-foreground">{profile.roleTitle}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Work Email</span>
                <span className="text-foreground">{profile.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Official Phone</span>
                <span className="text-foreground">{profile.phone}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Joining Date</span>
                <span className="text-foreground">{profile.joiningDate}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Employment Status</span>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {profile.status}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 text-xs text-muted-foreground">
              To request a change to statutory records or banking details, submit an HR request ticket via taylor.quinn@example.com.
            </div>
          </div>

          <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              Security & Facility Clearance
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Access Level</span>
                <span className="font-bold text-foreground text-sm">{profile.securityClearance}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Assigned Facilities</span>
                <span className="font-semibold text-foreground">{profile.facilityLocation}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Emergency Contact</span>
                <span className="text-foreground">{profile.emergencyContact}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Letters View */}
      {activeTab === "letters" && (
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Official Company Employment Letters & Notices (IATF 16949 / ISO 9001 Governed)
            </h3>
          </div>
          <div className="divide-y divide-border text-xs">
            {letters.map((ltr) => (
              <div key={ltr.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{ltr.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-secondary text-secondary-foreground font-semibold">
                      {ltr.referenceNumber}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {ltr.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{ltr.summary}</p>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    Effective: {ltr.effectiveDate} · Authorized Signer: {ltr.signerName}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedLetter(ltr)}
                    className="h-7 text-xs gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect Letter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policies View */}
      {activeTab === "policies" && (
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Assigned Corporate & Quality Standards Policies
            </h3>
          </div>
          <div className="divide-y divide-border text-xs">
            {policies.map((pol) => (
              <div key={pol.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{pol.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-semibold">
                      {pol.revision}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        pol.status === "Acknowledged"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {pol.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{pol.summary}</p>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    Compliance Category: {pol.category} · Deadline: {pol.deadline}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {pol.status === "Pending" ? (
                    <Button
                      size="sm"
                      onClick={() => handleAcknowledgePolicy(pol.id)}
                      className="h-7 text-xs bg-primary text-primary-foreground font-semibold gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Acknowledge Policy
                    </Button>
                  ) : (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Acknowledged
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Training View */}
      {activeTab === "training" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trainings.map((trn) => (
            <div key={trn.id} className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {trn.courseCode} · {trn.category}
                  </span>
                  <h4 className="font-bold text-sm text-foreground mt-0.5">{trn.title}</h4>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    trn.status === "Completed"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                  }`}
                >
                  {trn.status.replace(/_/g, " ")}
                </span>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <div>Instructor / Lead: <span className="font-semibold text-foreground">{trn.trainer}</span></div>
                <div>Duration: <span className="font-semibold text-foreground">{trn.durationHours} Hours</span></div>
                {trn.scorePct !== undefined && (
                  <div>Assessment Score: <span className="font-bold text-emerald-600 dark:text-emerald-400">{trn.scorePct}%</span></div>
                )}
                {trn.certificateRef && (
                  <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium">
                    <Award className="w-3.5 h-3.5" />
                    <span>Certificate ID: {trn.certificateRef}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-end">
                {trn.status !== "Completed" ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedTraining(trn);
                      setQuizSubmitted(false);
                      setQuizAnswers({});
                    }}
                    className="h-7 text-xs bg-primary text-primary-foreground font-semibold"
                  >
                    Take Assessment Quiz
                  </Button>
                ) : (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Passed & Certified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Equipment View */}
      {activeTab === "assets" && (
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Equipment, Tools & Measurement Assets Assigned to Employee
            </h3>
          </div>
          <div className="divide-y divide-border text-xs">
            {assets.map((ast) => (
              <div key={ast.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{ast.assetName}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-semibold">
                      {ast.assetTag}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Category: {ast.category} · Serial No: {ast.serialNumber} · Assigned: {ast.assignedDate}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Condition: {ast.condition}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forms & Surveys View */}
      {activeTab === "forms" && (
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Assigned Operational Questionnaires & Pulse Surveys
            </h3>
          </div>
          <div className="divide-y divide-border text-xs">
            {forms.map((frm) => (
              <div key={frm.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{frm.title}</span>
                    {frm.isAnonymous && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        100% Anonymous
                      </span>
                    )}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        frm.status === "Submitted"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      }`}
                    >
                      {frm.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Code: {frm.formCode} · Due Date: {frm.dueDate}
                  </div>
                </div>

                <div>
                  {frm.status !== "Submitted" ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        setForms((prev) =>
                          prev.map((f) => (f.id === frm.id ? { ...f, status: "Submitted" } : f))
                        );
                        setNoticeMessage(`Survey ${frm.formCode} submitted successfully.`);
                      }}
                      className="h-7 text-xs bg-primary text-primary-foreground font-semibold"
                    >
                      Fill & Submit
                    </Button>
                  ) : (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Response Logged
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {selectedTraining && (
        <Dialog open={!!selectedTraining} onOpenChange={() => setSelectedTraining(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">{selectedTraining.title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Passing criteria: 80% or higher for IATF certification.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2 text-xs">
              {selectedTraining.quizQuestions.map((q, idx) => (
                <div key={q.id} className="space-y-2 p-3 rounded-lg bg-muted/40 border border-border">
                  <div className="font-semibold text-foreground">
                    Question {idx + 1}: {q.question}
                  </div>
                  <div className="space-y-1.5">
                    {q.options.map((opt, optIdx) => (
                      <label key={optIdx} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-muted">
                        <input
                          type="radio"
                          name={q.id}
                          checked={quizAnswers[q.id] === optIdx}
                          onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })}
                          className="w-3.5 h-3.5 text-primary"
                        />
                        <span className="text-xs text-foreground">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setSelectedTraining(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    handleSubmitQuiz(selectedTraining.id);
                    setSelectedTraining(null);
                  }}
                  className="bg-primary text-primary-foreground font-semibold"
                >
                  Submit Assessment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Letter Inspection Modal */}
      {selectedLetter && (
        <Dialog open={!!selectedLetter} onOpenChange={() => setSelectedLetter(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">{selectedLetter.title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Ref: {selectedLetter.referenceNumber} · Effective: {selectedLetter.effectiveDate}
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 rounded-lg bg-muted/30 border border-border text-xs space-y-3 font-serif leading-relaxed">
              <div className="text-center font-bold font-sans text-sm pb-2 border-b border-border">
                HEXENSE LABS PRIVATE LIMITED / SIX SENSE MOBILITY
              </div>
              <p>
                This certifies that <strong>{profile.name}</strong> (Employee ID: {profile.employeeCode}) is an authorized member of Hexense Labs Private Limited.
              </p>
              <p>{selectedLetter.summary}</p>
              <div className="pt-4 flex items-center justify-between font-sans text-[11px] border-t border-border">
                <div>
                  <div className="font-bold">{selectedLetter.signerName}</div>
                  <div className="text-muted-foreground">Authorized Signatory</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-emerald-600 font-bold">DIGITALLY VERIFIED ✓</div>
                  <div className="text-muted-foreground">{selectedLetter.effectiveDate}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedLetter(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
