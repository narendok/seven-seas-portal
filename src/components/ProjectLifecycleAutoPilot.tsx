import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, X, CheckCircle2, ArrowRight, Sparkles, UserCheck, ShieldCheck, Cpu, Wrench } from "lucide-react";

export type AutoPilotStep = {
  id: string;
  title: string;
  subtitle: string;
  durationMs: number;
  action: () => void | Promise<void>;
};

interface ProjectLifecycleAutoPilotProps {
  active: boolean;
  onClose: () => void;
  onCreateTask: (title: string, priority: string, scope: string) => void;
  onUpdateTaskStatus: (newStatus: string) => void;
  onSwitchPersona: (personaId: string) => void;
  onOpenLifecycleHub: () => void;
  onAdvanceLifecycleStage: (stage: number) => void;
  onCloseLifecycleHub: () => void;
  onOpenProjectAnalysis: (projectId: string) => void;
  onSelectProjectTab: (tabIndex: number) => void;
  onToggleBleUpgrade: (upgrade: boolean) => void;
  onOpenClientPreview: () => void;
  onSignOffClientMilestone: () => void;
}

export function ProjectLifecycleAutoPilot({
  active,
  onClose,
  onCreateTask,
  onUpdateTaskStatus,
  onSwitchPersona,
  onOpenLifecycleHub,
  onAdvanceLifecycleStage,
  onCloseLifecycleHub,
  onOpenProjectAnalysis,
  onSelectProjectTab,
  onToggleBleUpgrade,
  onOpenClientPreview,
  onSignOffClientMilestone,
}: ProjectLifecycleAutoPilotProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: 200, y: 150 });
  const [showRipple, setShowRipple] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const steps: AutoPilotStep[] = [
    {
      id: "step-1-create",
      title: "Step 1/7: Beginning Project — Intake & Record Creation",
      subtitle: "Creating customer requirement intake record: 'HLPL-OBD4-01 · 4G OBD-II Smart Tracker' (Ashok Leyland 25,000 units/yr commit).",
      durationMs: 4500,
      action: () => {
        setCursorPos({ x: window.innerWidth * 0.75, y: 180 });
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 600);
        onCreateTask(
          "4G OBD-II Smart Tracker — Customer SOR & Intake",
          "Critical",
          "Commercial fleet requirement from Ashok Leyland. 25,000 units/year. SAE J1962, Dual CAN ISO 15765-4, 4G LTE Cat-1, IP54/IP67 rated enclosure."
        );
      },
    },
    {
      id: "step-2-status",
      title: "Step 2/7: Status Lifecycle — Transitioning to 'Approved'",
      subtitle: "Reviewing work queue, advancing intake record status from 'Open' → 'In review' → 'Approved'.",
      durationMs: 4000,
      action: () => {
        setCursorPos({ x: window.innerWidth * 0.45, y: 350 });
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 600);
        onUpdateTaskStatus("Approved");
      },
    },
    {
      id: "step-3-sales-account",
      title: "Step 3a/7: Account Switch — Priya Sharma (SAL Lead)",
      subtitle: "Logging in as Sales & BD Lead to verify customer SOR terms, Mutual NDA, and volume tier quotation.",
      durationMs: 3800,
      action: () => {
        setCursorPos({ x: window.innerWidth * 0.28, y: 30 });
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 600);
        onSwitchPersona("sales");
      },
    },
    {
      id: "step-3-ehw-account",
      title: "Step 3b/7: Account Switch — Avery Vale (EHW Lead)",
      subtitle: "Logging in as Embedded Hardware Lead to inspect microcontroller (STM32F405VG), 4G modem (Quectel EC200U), and Dual CAN transceivers.",
      durationMs: 3800,
      action: () => {
        setCursorPos({ x: window.innerWidth * 0.28, y: 30 });
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 600);
        onSwitchPersona("ehw");
      },
    },
    {
      id: "step-3-sit-account",
      title: "Step 3c/7: Account Switch — Kai Morgan (SIT Service Lead)",
      subtitle: "Logging in as Service & IT Lead to verify vehicle mounting envelope, J1962 clearance, and dealer fitment protocol (HLPL-OBD4-SIT-MNT-01).",
      durationMs: 3800,
      action: () => {
        setCursorPos({ x: window.innerWidth * 0.28, y: 30 });
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 600);
        onSwitchPersona("sit");
      },
    },
    {
      id: "step-3-admin-account",
      title: "Step 3d/7: Returning to Executive Admin / MD Context",
      subtitle: "Restoring full administrative oversight across all 11 departments.",
      durationMs: 3000,
      action: () => {
        setCursorPos({ x: window.innerWidth * 0.28, y: 30 });
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 600);
        onSwitchPersona("admin");
      },
    },
    {
      id: "step-4-lifecycle-stages",
      title: "Step 4/7: Advancing 9-Stage Automotive Lifecycle Hub",
      subtitle: "Opening End-to-End Lifecycle Hub: progressing through Enquiry → Feasibility Gate → PoC Bring-up → SMT Pilot → TAC ARAI → Stage 9 Service Field Mounting.",
      durationMs: 6500,
      action: () => {
        setCursorPos({ x: window.innerWidth * 0.5, y: 220 });
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 600);
        onOpenLifecycleHub();
        setTimeout(() => onAdvanceLifecycleStage(1), 1000); // Stage 2 Feasibility
        setTimeout(() => onAdvanceLifecycleStage(3), 2200); // Stage 4 PoC
        setTimeout(() => onAdvanceLifecycleStage(4), 3400); // Stage 5 Pilot
        setTimeout(() => onAdvanceLifecycleStage(8), 4600); // Stage 9 PDI & Service Field Mounting
        setTimeout(() => onCloseLifecycleHub(), 5800);
      },
    },
    {
      id: "step-5-page-1-shared",
      title: "Step 5/7: Page 1 Shared Analysis (One-View, Dimensions & J1962 Socket)",
      subtitle: "Opening unified shared analysis for HLPL-OBD4-01: inspecting 16-pin SAE J1962 socket, CAD envelope (52.4x48.2x26.0mm), and block diagram.",
      durationMs: 5000,
      action: () => {
        setCursorPos({ x: window.innerWidth * 0.35, y: 180 });
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 600);
        onOpenProjectAnalysis("HLPL-OBD4-01");
        setTimeout(() => onSelectProjectTab(0), 800); // Tab 1: One-View
        setTimeout(() => onSelectProjectTab(1), 2200); // Tab 2: Dimensions
        setTimeout(() => onSelectProjectTab(2), 3400); // Tab 3: Block Diagram
        setTimeout(() => onSelectProjectTab(3), 4200); // Tab 4: SIT Vehicle Mounting
      },
    },
    {
      id: "step-6-ble-upgrade",
      title: "Step 6/7: Revision Update — Adding BLE 5.2 Version (Rev 02)",
      subtitle: "Upgrading OBD tracker from Rev 01 → Rev 02: Nordic nRF52820 BLE co-processor illuminates in glowing cyan on the system architecture block diagram.",
      durationMs: 4500,
      action: () => {
        setCursorPos({ x: window.innerWidth * 0.8, y: 160 });
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 600);
        onToggleBleUpgrade(true);
        onSelectProjectTab(2); // View block diagram with BLE
      },
    },
    {
      id: "step-7-client-approval",
      title: "Step 7/7: Client Approval & Milestone Sign-Off via Client Link",
      subtitle: "Switching to Client Portal simulator: generating tokenized client link and completing official customer milestone approval.",
      durationMs: 5500,
      action: () => {
        setCursorPos({ x: window.innerWidth * 0.6, y: 120 });
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 600);
        onOpenClientPreview();
        setTimeout(() => {
          setCursorPos({ x: window.innerWidth * 0.5, y: 480 });
          setShowRipple(true);
          setTimeout(() => setShowRipple(false), 600);
          onSignOffClientMilestone();
        }, 2000);
      },
    },
  ];

  // Auto-advance through steps when active and playing
  useEffect(() => {
    if (!active || !isPlaying) return;

    const currentStep = steps[currentStepIndex];
    if (!currentStep) return;

    // Execute current step action
    currentStep.action();

    // Schedule next step
    timerRef.current = setTimeout(() => {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false); // Finished tour
      }
    }, currentStep.durationMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, isPlaying, currentStepIndex]);

  if (!active) return null;

  const currentStep = steps[currentStepIndex] ?? steps[0];
  const progressPct = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <>
      {/* 1. Animated Gliding Virtual Pointer */}
      <div
        className="fixed z-[9999999] pointer-events-none transition-all duration-700 ease-out"
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="relative">
          {/* Main Pointer Dot */}
          <div className="size-6 rounded-full bg-red-600 border-2 border-white shadow-[0_0_20px_rgba(239,68,68,1),0_0_35px_rgba(6,182,212,0.9)] grid place-items-center animate-pulse">
            <div className="size-1.5 rounded-full bg-white" />
          </div>

          {/* Label tooltip next to cursor */}
          <div className="absolute left-7 top-0 bg-slate-900/90 text-cyan-300 border border-cyan-500/40 rounded px-2 py-0.5 text-[11px] font-mono whitespace-nowrap shadow-md backdrop-blur">
            Agent Auto-Pilot Active
          </div>

          {/* Click Ripple Effect */}
          {showRipple && (
            <div className="absolute -inset-2 rounded-full border-2 border-cyan-400 animate-ping pointer-events-none" />
          )}
        </div>
      </div>

      {/* 2. Floating Top Executive HUD Banner */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999990] w-[95%] max-w-4xl rounded-2xl border border-cyan-500/40 bg-slate-950/95 text-slate-100 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md transition-all">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex size-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-3 bg-cyan-500" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-amber-400" />
              Live Project Lifecycle Auto-Pilot
            </span>
            <span className="rounded-full bg-cyan-950/80 border border-cyan-600/50 px-2 py-0.5 font-mono text-[10px] text-cyan-300 font-semibold">
              {progressPct}% Complete
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              {isPlaying ? <Pause className="size-3.5 text-amber-400" /> : <Play className="size-3.5 text-emerald-400" />}
              {isPlaying ? "Pause" : "Resume"}
            </button>

            <button
              onClick={() => {
                setCurrentStepIndex(0);
                setIsPlaying(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <RotateCcw className="size-3.5 text-cyan-400" />
              Restart
            </button>

            {currentStepIndex < steps.length - 1 && (
              <button
                onClick={() => setCurrentStepIndex((i) => Math.min(steps.length - 1, i + 1))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-600/60 bg-cyan-950/60 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 transition-colors"
              >
                Skip <ArrowRight className="size-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-1"
              title="Close Auto-Pilot"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Step Info */}
        <div className="mt-3 flex items-start gap-3">
          <div className="shrink-0 rounded-xl bg-cyan-950/80 border border-cyan-500/40 p-2 text-cyan-400">
            {currentStepIndex <= 1 && <Sparkles className="size-5 text-amber-400" />}
            {currentStepIndex >= 2 && currentStepIndex <= 5 && <UserCheck className="size-5 text-cyan-400" />}
            {currentStepIndex === 6 && <ShieldCheck className="size-5 text-indigo-400" />}
            {currentStepIndex === 7 && <Cpu className="size-5 text-emerald-400" />}
            {currentStepIndex >= 8 && <CheckCircle2 className="size-5 text-emerald-400" />}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white tracking-tight">{currentStep?.title || ""}</h4>
            <p className="mt-0.5 text-xs text-slate-300 leading-relaxed">{currentStep?.subtitle || ""}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </>
  );
}
