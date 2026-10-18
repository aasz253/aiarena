import React from 'react';
import { 
  ArrowLeft, 
  Cpu, 
  ShieldCheck, 
  Bug, 
  Terminal, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Discipline } from '../../types';
import { sounds } from '../../services/sound';

interface DisciplinesViewProps {
  onSelectDiscipline: (d: Discipline) => void;
  onBack: () => void;
}

export const DisciplinesView: React.FC<DisciplinesViewProps> = ({
  onSelectDiscipline,
  onBack
}) => {
  const disciplines = [
    {
      id: 'DevSecOps' as Discipline,
      title: 'AI DevSecOps',
      tagline: 'AI Engineering Meets Secure Software Delivery',
      desc: 'Master the end-to-end software delivery pipeline under adversarial conditions. Audit GitHub Actions workflows, harden Dockerfiles against root breakouts, enforce Kubernetes Restricted Pod standards, and secure agentic LLM tool execution architectures.',
      icon: Cpu,
      color: 'sky',
      competencies: [
        'CI/CD Pipeline Security & Token Least Privilege',
        'Multi-stage Dockerfile Hardening & Non-Root Execution',
        'Kubernetes Admission Standards & Capabilities Dropping',
        'Autonomous AI Agent Tool Sandboxing & Prompt Guardrails'
      ]
    },
    {
      id: 'Cybersecurity' as Discipline,
      title: 'Cybersecurity & SOC Operations',
      tagline: 'Defend Fictional Enterprise Infrastructure Against Advanced Threats',
      desc: 'Step into a high-stakes Security Operations Center (SOC). Investigate executive BEC spear-phishing campaigns, correlate Windows SIEM authentication event logs (PsExec / Pass-the-Hash), design zero-trust DMZ firewall topologies, and neutralize cloud IAM privilege escalation exploits.',
      icon: ShieldCheck,
      color: 'indigo',
      competencies: [
        'SPF, DKIM, DMARC & IDN Homoglyph Email Forensics',
        'Windows Event Log SIEM Correlation (4624, 4625, 7045)',
        'Zero-Trust Network DMZ Segmentation & Bastions',
        'Cloud IAM Permission Boundaries & Role Escalation Defense'
      ]
    },
    {
      id: 'Malware' as Discipline,
      title: 'Malware & Virus Analysis',
      tagline: 'Forensic Cleanroom Reverse-Engineering & Behavioral Triage',
      desc: 'Work in an isolated virtual cleanroom. Analyze file entropy to unmask UPX packers, decompile Win32 memory injection sequences (VirtualAllocEx, WriteProcessMemory, CreateRemoteThread), trace EDR parent-child process lineages, and distinguish ransomware heuristics from legitimate backup tools.',
      icon: Bug,
      color: 'violet',
      competencies: [
        'Shannon Byte Entropy & PE Header Section Inspection',
        'Win32 Process Injection & Memory RWX Detection',
        'Living-Off-the-Land (LOLBin) certutil & reg EDR Lineage',
        'Ransomware Volume Shadow Copy Destruction Tripwires'
      ]
    },
    {
      id: 'Coding' as Discipline,
      title: 'Competitive Coding Challenges',
      tagline: 'Outcode the Machine in Secure Algorithmic Problem-Solving',
      desc: 'Compete directly against NEXUS in code execution speed, security, and algorithmic efficiency. Build high-throughput port scan detectors, implement defensive SQL input sanitizers, program Policy-as-Code admission validators, and review vulnerable authentication middleware.',
      icon: Terminal,
      color: 'emerald',
      competencies: [
        'Network Flow Sliding-Window Port Scan Detection',
        'Strict Allowlist Input Sanitization & Parameterization',
        'Policy-as-Code Kubernetes Manifest Validation',
        'Cryptographic Algorithm Pinning & JWT Defense'
      ]
    }
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <button
          onClick={() => {
            sounds.click();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Arena Hub</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-sans">
          The Four Technical Disciplines
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Each discipline is an equal pillar of the AI Arena curriculum. Master all four sectors to conquer the Cross-Discipline Gauntlet and claim the title of Arena Champion.
        </p>
      </div>

      {/* 4 Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {disciplines.map(d => {
          const Icon = d.icon;
          return (
            <div 
              key={d.id}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-3 rounded-xl bg-slate-800 border border-slate-700 text-${d.color}-400`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-sans">{d.title}</h2>
                    <span className="text-xs font-mono text-slate-400 block">{d.tagline}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {d.desc}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-bold block mb-1">
                    Key Competencies Evaluated:
                  </span>
                  {d.competencies.map(comp => (
                    <div key={comp} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                      <span>{comp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.click();
                  onSelectDiscipline(d.id);
                }}
                className="w-full py-3 text-xs font-bold uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>Launch {d.title} Match</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
