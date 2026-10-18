import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  ShieldAlert,
  Send,
  GitBranch,
  Layers,
  FileCode,
  ShieldCheck,
  Terminal,
  Play
} from 'lucide-react';
import { Challenge } from '../../types';
import { sounds } from '../../services/sound';

interface DevSecOpsWorkspaceProps {
  challenge: Challenge;
  onSubmit: (result: { isCorrect: boolean; evidenceFound: boolean; hadUnsafePenalty: boolean }) => void;
  isReadOnly?: boolean;
}

export const DevSecOpsWorkspace: React.FC<DevSecOpsWorkspaceProps> = ({
  challenge,
  onSubmit,
  isReadOnly = false
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [activePatches, setActivePatches] = useState<Record<string, boolean>>({});
  const [evidenceDiscovered, setEvidenceDiscovered] = useState(false);
  const [activePipelineStage, setActivePipelineStage] = useState('CONTAINER');
  const [pipelineScanRunning, setPipelineScanRunning] = useState(false);
  const [pipelineGateStatus, setPipelineGateStatus] = useState<'FAILING' | 'PASSING' | 'EVALUATING'>('FAILING');

  const pipelineStages = [
    { id: 'SRC', label: 'Source', stage: 'source' },
    { id: 'SAST', label: 'SAST Scan', stage: 'sast' },
    { id: 'BUILD', label: 'Build CI', stage: 'build' },
    { id: 'CONTAINER', label: 'Container', stage: 'container' },
    { id: 'ADMISSION', label: 'Admission', stage: 'admission' },
    { id: 'DEPLOY', label: 'Deploy', stage: 'deploy' }
  ];

  // Specific remediations per challenge
  const patchTemplates: Record<string, { id: string; label: string; patchLine: string; isCorrectPatch: boolean }[]> = {
    'dso-01': [
      { id: 'p1', label: 'Enforce Least-Privilege: permissions: { contents: read }', patchLine: 'permissions: { contents: read }', isCorrectPatch: true },
      { id: 'p2', label: 'Pin Immutable Commit SHA: actions/checkout@b4ffde5c8... (v4)', patchLine: 'uses: actions/checkout@b4ffde5c8...', isCorrectPatch: true },
      { id: 'p3', label: 'Inject Trivy Container Vulnerability Scanner Step', patchLine: '- uses: aquasecurity/trivy-action@master', isCorrectPatch: true },
      { id: 'p4', label: 'Increase CI Runner CPU to 64 Cores', patchLine: 'runs-on: ubuntu-64core', isCorrectPatch: false }
    ],
    'dso-02': [
      { id: 'p1', label: 'Switch from node:latest to node:20-alpine digest', patchLine: 'FROM node:20-alpine@sha256:7142d...', isCorrectPatch: true },
      { id: 'p2', label: 'Drop Root: Add unprivileged "USER node" directive', patchLine: 'USER node', isCorrectPatch: true },
      { id: 'p3', label: 'Add .dockerignore exclusion for .env and .git', patchLine: '# Exclude .env and .git via .dockerignore', isCorrectPatch: true },
      { id: 'p4', label: 'Grant chmod 777 to working directory', patchLine: 'RUN chmod -R 777 /app', isCorrectPatch: false }
    ],
    'dso-03': [
      { id: 'p1', label: 'Drop Host Namespace: hostPID: false', patchLine: 'hostPID: false', isCorrectPatch: true },
      { id: 'p2', label: 'Enforce Restricted Pod: privileged: false & drop: ["ALL"]', patchLine: 'securityContext: { privileged: false, capabilities: { drop: ["ALL"] } }', isCorrectPatch: true },
      { id: 'p3', label: 'Set readOnlyRootFilesystem: true', patchLine: 'readOnlyRootFilesystem: true', isCorrectPatch: true },
      { id: 'p4', label: 'Scale replicas to 10 for high availability', patchLine: 'replicas: 10', isCorrectPatch: false }
    ],
    'dso-04': [
      { id: 'p1', label: 'Isolate LLM tool calls in ephemeral WebAssembly / gVisor sandbox', patchLine: 'const sandboxedResult = await wasmSandbox.exec(tool, args);', isCorrectPatch: true },
      { id: 'p2', label: 'Enforce strict schema allowlist for permissible tool operations', patchLine: 'if (!toolAllowlist.has(command)) throw new SecurityException();', isCorrectPatch: true },
      { id: 'p3', label: 'Require explicit MFA/human confirmation for state-mutating tools', patchLine: 'if (requiresAuth(tool)) await requestHumanApproval();', isCorrectPatch: true },
      { id: 'p4', label: 'Add "Please be safe" to system prompt text', patchLine: 'prompt += " Please do not run dangerous code";', isCorrectPatch: false }
    ]
  };

  const currentPatches = patchTemplates[challenge.id] || [
    { id: 'p1', label: 'Apply least privilege permission boundaries', patchLine: 'permissions: minimal', isCorrectPatch: true },
    { id: 'p2', label: 'Pin all upstream action dependencies to commit SHAs', patchLine: 'uses: action@sha256', isCorrectPatch: true }
  ];

  const handleTogglePatch = (patchId: string) => {
    if (isReadOnly) return;
    sounds.click();
    setActivePatches(prev => ({
      ...prev,
      [patchId]: !prev[patchId]
    }));
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (isReadOnly) return;
    sounds.click();
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleDiscoverEvidence = () => {
    if (!evidenceDiscovered) {
      sounds.correct();
      setEvidenceDiscovered(true);
    }
  };

  const runPipelineAudit = () => {
    sounds.click();
    setPipelineScanRunning(true);
    setPipelineGateStatus('EVALUATING');

    setTimeout(() => {
      setPipelineScanRunning(false);
      // If at least 2 correct patches are toggled and no bad patch is on
      const correctPatchesToggled = currentPatches.filter(p => p.isCorrectPatch && activePatches[p.id]).length;
      const badPatchesToggled = currentPatches.filter(p => !p.isCorrectPatch && activePatches[p.id]).length;

      if (correctPatchesToggled >= 2 && badPatchesToggled === 0) {
        sounds.correct();
        setPipelineGateStatus('PASSING');
      } else {
        sounds.wrong();
        setPipelineGateStatus('FAILING');
      }
    }, 700);
  };

  const handleSubmit = () => {
    if (isReadOnly) return;
    sounds.click();

    let allCorrect = true;
    let hadUnsafe = false;

    if (challenge.questions) {
      for (const q of challenge.questions) {
        const pickedId = selectedAnswers[q.id];
        const option = q.options.find(o => o.id === pickedId);
        if (!option || !option.isCorrect) {
          allCorrect = false;
        }
        if (option?.isUnsafePenalty) {
          hadUnsafe = true;
        }
      }
    }

    // Check if any unsafe patch was toggled
    const badPatchesToggled = currentPatches.some(p => !p.isCorrectPatch && activePatches[p.id]);
    if (badPatchesToggled) {
      hadUnsafe = true;
    }

    if (allCorrect && !badPatchesToggled) {
      sounds.correct();
    } else {
      sounds.wrong();
    }

    onSubmit({
      isCorrect: allCorrect && !badPatchesToggled,
      evidenceFound: evidenceDiscovered,
      hadUnsafePenalty: hadUnsafe
    });
  };

  const isComplete = challenge.questions 
    ? challenge.questions.every(q => selectedAnswers[q.id]) 
    : false;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Header: Pipeline Stage Visualizer */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-[#090d16]/90 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-sky-400" />
            <span className="text-xs font-bold font-mono uppercase text-slate-200">
              Interactive DevSecOps Delivery Pipeline
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400">Security Gate:</span>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
              pipelineGateStatus === 'PASSING' 
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50' 
                : pipelineGateStatus === 'EVALUATING'
                ? 'bg-sky-950/80 text-sky-400 border border-sky-800/50 animate-pulse'
                : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
            }`}>
              {pipelineGateStatus === 'PASSING' ? 'POLICY COMPLIANT' : pipelineGateStatus === 'EVALUATING' ? 'SCANNING...' : 'BLOCKED VULNERABILITY'}
            </span>
          </div>
        </div>

        {/* Pipeline Interactive Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {pipelineStages.map(stage => {
            const isActive = activePipelineStage === stage.id;
            const isPassing = pipelineGateStatus === 'PASSING';
            return (
              <button
                key={stage.id}
                onClick={() => {
                  sounds.click();
                  setActivePipelineStage(stage.id);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isActive 
                    ? 'border-sky-500 bg-sky-500/15 text-white shadow-md shadow-sky-950/50' 
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold font-mono">{stage.label}</span>
                  {isPassing ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className={`h-3.5 w-3.5 ${stage.id === 'CONTAINER' || stage.id === 'ADMISSION' ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
                  )}
                </div>
                <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                  {isPassing ? 'Enforced' : stage.id === 'CONTAINER' ? 'Root Breach' : 'Audit Active'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Artifact Manifest Viewer + Interactive Patch Injector */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="rounded-2xl border border-slate-800 bg-[#05070a] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-mono text-slate-200 font-bold">{challenge.targetArtifactName}</span>
              </div>
              <span className="text-[10px] font-mono text-sky-400 uppercase px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/40">
                {challenge.artifactType}
              </span>
            </div>

            {/* Code / Config Display with Line Numbers and Diff Injection */}
            <div className="p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[420px] leading-relaxed">
              <pre className="grid grid-cols-[auto_1fr] gap-x-4">
                {(challenge.artifactContent || '').split('\n').map((line, idx) => {
                  const isDangerous = line.includes('write-all') || line.includes('privileged: true') || line.includes('hostPID: true') || line.includes('root') || line.includes('sk_live_');
                  return (
                    <React.Fragment key={idx}>
                      <span className="text-slate-600 select-none text-right tabular-nums">{idx + 1}</span>
                      <span className={isDangerous ? 'text-rose-400 bg-rose-950/30 px-1 rounded font-semibold' : ''}>
                        {line}
                      </span>
                    </React.Fragment>
                  );
                })}
              </pre>

              {/* Show Active Applied Patches as Green Diff Lines */}
              {Object.keys(activePatches).some(k => activePatches[k]) && (
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono text-emerald-400 block mb-1 uppercase font-bold">
                    + Applied Security Policy Overrides:
                  </span>
                  {currentPatches.filter(p => activePatches[p.id]).map(p => (
                    <div key={p.id} className="text-[11px] font-mono text-emerald-300 bg-emerald-950/20 px-2 py-0.5 rounded my-0.5 flex items-center gap-1.5">
                      <span>+</span>
                      <span>{p.patchLine}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Policy Patch Injector Panel */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-sky-400" />
                <span>Interactive Hardening Remediation Matrix</span>
              </span>
              <button
                onClick={runPipelineAudit}
                disabled={pipelineScanRunning}
                className="px-2.5 py-1 text-[11px] font-mono font-bold uppercase rounded bg-sky-600 hover:bg-sky-500 text-white transition-colors flex items-center gap-1"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Verify Gate</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {currentPatches.map(patch => {
                const isToggled = !!activePatches[patch.id];
                return (
                  <button
                    key={patch.id}
                    onClick={() => handleTogglePatch(patch.id)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                      isToggled 
                        ? patch.isCorrectPatch 
                          ? 'border-emerald-500/60 bg-emerald-950/20 text-emerald-300' 
                          : 'border-rose-500/60 bg-rose-950/20 text-rose-300'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex-1 truncate">{patch.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-2 ${
                      isToggled ? 'bg-slate-900' : 'bg-slate-900 text-slate-500'
                    }`}>
                      {isToggled ? (patch.isCorrectPatch ? 'APPLIED' : 'UNSAFE') : 'DISABLED'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hidden Evidence Discovery Card */}
          {challenge.hiddenEvidence && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-sky-400" />
                  <span className="text-xs font-bold text-white uppercase font-mono">
                    Deep Security Inspection
                  </span>
                  {evidenceDiscovered && (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      [+{challenge.hiddenEvidence.points} PTS FOUND]
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {evidenceDiscovered 
                    ? challenge.hiddenEvidence.description 
                    : "Inspect hidden supply chain dependencies and subtle privilege flags in the target manifest."}
                </p>
              </div>

              {!evidenceDiscovered && !isReadOnly && (
                <button
                  onClick={handleDiscoverEvidence}
                  className="px-3 py-1.5 text-xs font-medium text-sky-400 hover:text-white bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/50 rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  Analyze Indicators
                </button>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Problem Description & Diagnostic Remediation */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-sky-400 mb-1">
              <span>Mission Objective</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{challenge.difficulty} Tier</span>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">{challenge.title}</h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">{challenge.description}</p>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
              <span className="text-sky-300 font-semibold block mb-0.5">Defensive Benchmark:</span>
              {challenge.learningObjective}
            </div>
          </div>

          {/* Diagnostic Questions & Options */}
          {challenge.questions?.map(q => (
            <div key={q.id} className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-3">
              <div className="flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <h3 className="text-xs font-bold text-slate-200 leading-snug">{q.prompt}</h3>
              </div>

              <div className="space-y-2 pt-1">
                {q.options.map(opt => {
                  const isSelected = selectedAnswers[q.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      disabled={isReadOnly}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition-all leading-relaxed ${
                        isSelected 
                          ? 'border-sky-500 bg-sky-500/15 text-white shadow-sm' 
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-sky-400 bg-sky-500' : 'border-slate-600'
                        }`}>
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="flex-1">{opt.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Submit Action */}
          {!isReadOnly && (
            <div className="pt-2">
              <button
                onClick={handleSubmit}
                disabled={!isComplete}
                className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all ${
                  isComplete 
                    ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-950/50 cursor-pointer active:scale-[0.99]' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="h-4 w-4" />
                <span>Submit Security Remediation & Lockdown</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
