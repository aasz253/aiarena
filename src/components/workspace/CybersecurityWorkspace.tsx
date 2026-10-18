import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  Network, 
  Search, 
  Send,
  Radio,
  FileSearch,
  Lock,
  Server,
  Globe,
  Database,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Challenge } from '../../types';
import { sounds } from '../../services/sound';

interface CybersecurityWorkspaceProps {
  challenge: Challenge;
  onSubmit: (result: { isCorrect: boolean; evidenceFound: boolean; hadUnsafePenalty: boolean }) => void;
  isReadOnly?: boolean;
}

export const CybersecurityWorkspace: React.FC<CybersecurityWorkspaceProps> = ({
  challenge,
  onSubmit,
  isReadOnly = false
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [evidenceDiscovered, setEvidenceDiscovered] = useState(false);
  const [activeTab, setActiveTab] = useState<'topology' | 'artifact' | 'soc_alerts'>('topology');
  const [logFilterQuery, setLogFilterQuery] = useState('');
  const [selectedNetworkNode, setSelectedNetworkNode] = useState<string>('db');
  const [isolatedNodes, setIsolatedNodes] = useState<Record<string, boolean>>({});

  const alerts = [
    { id: 'al-1', time: '09:14:02', sev: 'CRITICAL', title: 'Perimeter Ingress Anomaly', src: '185.220.101.5' },
    { id: 'al-2', time: '09:14:15', sev: 'HIGH', title: 'Suspicious Auth Event ID 4625', src: '10.0.4.88' },
    { id: 'al-3', time: '09:15:00', sev: 'MEDIUM', title: 'Port Sweep Detection', src: 'External' }
  ];

  const networkNodes = [
    { id: 'gateway', label: 'Perimeter Gateway', ip: '185.220.101.5', status: 'hostile', icon: Globe, details: 'Inbound Tor relay traffic. 1,420 unauthenticated ingress packets.' },
    { id: 'dmz', label: 'DMZ Reverse Proxy', ip: '192.168.10.5', status: 'warning', icon: Server, details: 'Port 80/443 ingress allowed. Routing unverified connections.' },
    { id: 'bastion', label: 'Internal Bastion', ip: '192.168.10.1', status: 'warning', icon: Server, details: 'SSH port 22 open to 0.0.0.0/0 without rate-limiting.' },
    { id: 'workstation', label: 'WS-FIN-09', ip: '10.0.4.88', status: 'compromised', icon: Server, details: 'Multiple Event ID 4625 failed logons, followed by PSEXESVC execution.' },
    { id: 'db', label: 'Production MongoDB', ip: '192.168.20.15', status: 'critical', icon: Database, details: 'Directly exposed to internet via rule 103 (Port 27017 exposed to 0.0.0.0/0).' }
  ];

  const toggleNodeIsolation = (nodeId: string) => {
    sounds.click();
    setIsolatedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
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

    if (allCorrect) {
      sounds.correct();
    } else {
      sounds.wrong();
    }

    onSubmit({
      isCorrect: allCorrect,
      evidenceFound: evidenceDiscovered,
      hadUnsafePenalty: hadUnsafe
    });
  };

  const isComplete = challenge.questions 
    ? challenge.questions.every(q => selectedAnswers[q.id]) 
    : false;

  const activeNodeInfo = networkNodes.find(n => n.id === selectedNetworkNode) || networkNodes[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      
      {/* SOC Tactical Header */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-[#090d16]/90 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase text-indigo-400 tracking-wider block font-bold">
              Security Operations Center (SOC) Console
            </span>
            <span className="text-sm font-bold text-white">
              Tactical Incident Response & Network Defense
            </span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              sounds.click();
              setActiveTab('topology');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'topology' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Network Topology
          </button>
          <button
            onClick={() => {
              sounds.click();
              setActiveTab('artifact');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'artifact' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Evidence Artifact
          </button>
          <button
            onClick={() => {
              sounds.click();
              setActiveTab('soc_alerts');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'soc_alerts' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Alerts (3)
          </button>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Topology / Artifact / Logs */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* TAB 1: INTERACTIVE NETWORK TOPOLOGY MAP */}
          {activeTab === 'topology' && (
            <div className="rounded-2xl border border-slate-800 bg-[#05070a] p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                    Interactive Ingress & Subnet Map
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Click nodes to isolate
                </span>
              </div>

              {/* Topology SVG Network Diagram */}
              <div className="relative py-4 px-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {networkNodes.map(node => {
                    const isSelected = selectedNetworkNode === node.id;
                    const isIsolated = !!isolatedNodes[node.id];
                    const Icon = node.icon;
                    return (
                      <div
                        key={node.id}
                        onClick={() => {
                          sounds.click();
                          setSelectedNetworkNode(node.id);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-indigo-500 bg-indigo-950/30 shadow-md' 
                            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${
                              node.status === 'critical' ? 'text-rose-500 animate-pulse' : node.status === 'compromised' ? 'text-rose-400' : 'text-indigo-400'
                            }`} />
                            <span className="text-xs font-bold text-white">{node.label}</span>
                          </div>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                            isIsolated 
                              ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                              : node.status === 'critical'
                              ? 'bg-rose-950 text-rose-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {isIsolated ? 'ISOLATED' : node.status}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 block">{node.ip}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Node Inspection Card */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white uppercase font-mono block">
                    Node Telemetry: {activeNodeInfo.label} ({activeNodeInfo.ip})
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeNodeInfo.details}
                  </p>
                </div>
                <button
                  onClick={() => toggleNodeIsolation(activeNodeInfo.id)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-lg transition-colors shrink-0 ${
                    isolatedNodes[activeNodeInfo.id]
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  {isolatedNodes[activeNodeInfo.id] ? 'Re-enable' : 'Isolate Node'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ARTIFACT VIEWER */}
          {activeTab === 'artifact' && (
            <div className="rounded-2xl border border-slate-800 bg-[#05070a] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileSearch className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-mono text-slate-200 font-bold">{challenge.targetArtifactName}</span>
                </div>
                <span className="text-[10px] font-mono text-indigo-300 uppercase px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40">
                  {challenge.artifactType}
                </span>
              </div>

              {/* Artifact Viewer with filter search */}
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter logs or strings (e.g. 4625, psexec, 27017)..."
                  value={logFilterQuery}
                  onChange={(e) => setLogFilterQuery(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 placeholder-slate-600 focus:outline-none w-full font-mono"
                />
              </div>

              <div className="p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[380px] leading-relaxed">
                <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300">
                  {(challenge.artifactContent || '')
                    .split('\n')
                    .filter(line => !logFilterQuery || line.toLowerCase().includes(logFilterQuery.toLowerCase()))
                    .join('\n')}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE SIEM ALERTS */}
          {activeTab === 'soc_alerts' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 shadow-xl">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase block mb-1">
                Active SIEM Alert Correlation Engine
              </span>
              {alerts.map(al => (
                <div key={al.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded ${
                      al.sev === 'CRITICAL' ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50' : 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                    }`}>
                      {al.sev}
                    </span>
                    <span className="text-white font-semibold ml-2">{al.title}</span>
                    <span className="text-slate-400 block text-[11px] font-mono mt-0.5">Origin: {al.src}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[10px]">{al.time}</span>
                </div>
              ))}
            </div>
          )}

          {/* Hidden Evidence Forensic Hunter */}
          {challenge.hiddenEvidence && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase font-mono">
                    SOC Threat Intelligence Correlation
                  </span>
                  {evidenceDiscovered && (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      [+{challenge.hiddenEvidence.points} PTS DISCOVERED]
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {evidenceDiscovered 
                    ? challenge.hiddenEvidence.description 
                    : "Correlate external threat intelligence feeds, Tor exit registries, and internal privilege escalation traces."}
                </p>
              </div>

              {!evidenceDiscovered && !isReadOnly && (
                <button
                  onClick={handleDiscoverEvidence}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-400 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/50 rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  Correlate Feeds
                </button>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Mission Brief & Defensive Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-indigo-400 mb-1">
              <span>Incident Response Playbook</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{challenge.difficulty} Tier</span>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">{challenge.title}</h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">{challenge.description}</p>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
              <span className="text-indigo-300 font-semibold block mb-0.5">Defensive Benchmark:</span>
              {challenge.learningObjective}
            </div>
          </div>

          {/* Incident Questions */}
          {challenge.questions?.map(q => (
            <div key={q.id} className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-3">
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
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
                          ? 'border-indigo-500 bg-indigo-500/15 text-white shadow-sm' 
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'
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
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/50 cursor-pointer active:scale-[0.99]' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="h-4 w-4" />
                <span>Execute Incident Containment Directive</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
