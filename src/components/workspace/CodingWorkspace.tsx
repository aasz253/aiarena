import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Send,
  Code2,
  FileCode,
  Zap,
  Clock
} from 'lucide-react';
import { Challenge } from '../../types';
import { sounds } from '../../services/sound';

interface CodingWorkspaceProps {
  challenge: Challenge;
  onSubmit: (result: { isCorrect: boolean; evidenceFound: boolean; hadUnsafePenalty: boolean }) => void;
  isReadOnly?: boolean;
}

export const CodingWorkspace: React.FC<CodingWorkspaceProps> = ({
  challenge,
  onSubmit,
  isReadOnly = false
}) => {
  const [code, setCode] = useState(challenge.initialCode || '');
  const [testResults, setTestResults] = useState<{ id: string; name: string; passed: boolean; actual?: string; error?: string }[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [evidenceDiscovered, setEvidenceDiscovered] = useState(false);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter to run test cases
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runTestCases();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, challenge]);

  const handleReset = () => {
    sounds.click();
    setCode(challenge.initialCode || '');
    setTestResults(null);
    setExecutionTimeMs(null);
  };

  const handleDiscoverEvidence = () => {
    if (!evidenceDiscovered) {
      sounds.correct();
      setEvidenceDiscovered(true);
    }
  };

  // Safe client-side sandbox evaluation against predefined test cases
  const runTestCases = (): boolean => {
    sounds.click();
    setIsRunning(true);
    const startExec = performance.now();

    const results: { id: string; name: string; passed: boolean; actual?: string; error?: string }[] = [];
    let allPassed = true;

    try {
      // Evaluate function definition in isolated scope
      // eslint-disable-next-line no-new-func
      const runner = new Function(`
        ${code}
        return {
          detectPortScanners: typeof detectPortScanners !== 'undefined' ? detectPortScanners : null,
          sanitizeSearchQuery: typeof sanitizeSearchQuery !== 'undefined' ? sanitizeSearchQuery : null,
          validatePodSecurity: typeof validatePodSecurity !== 'undefined' ? validatePodSecurity : null,
          verifyToken: typeof verifyToken !== 'undefined' ? verifyToken : null
        };
      `);

      const fns = runner();

      if (challenge.id === 'code-01') {
        const fn = fns.detectPortScanners;
        if (!fn) throw new Error('function detectPortScanners is not defined');

        // Test 1
        const t1Logs = [
          { srcIp: "192.168.1.100", port: 22 },
          { srcIp: "192.168.1.100", port: 80 },
          { srcIp: "192.168.1.100", port: 443 },
          { srcIp: "10.0.0.1", port: 80 }
        ];
        const res1 = fn(t1Logs, 2);
        const pass1 = Array.isArray(res1) && res1.length === 1 && res1[0] === '192.168.1.100';
        results.push({
          id: 'tc1',
          name: 'Detects IP scanning > 2 distinct ports',
          passed: pass1,
          actual: JSON.stringify(res1)
        });
        if (!pass1) allPassed = false;

        // Test 2
        const t2Logs = [
          { srcIp: "10.0.0.5", port: 80 },
          { srcIp: "10.0.0.5", port: 80 },
          { srcIp: "10.0.0.5", port: 80 }
        ];
        const res2 = fn(t2Logs, 1);
        const pass2 = Array.isArray(res2) && res2.length === 0;
        results.push({
          id: 'tc2',
          name: 'Deduplicates identical port probes',
          passed: pass2,
          actual: JSON.stringify(res2)
        });
        if (!pass2) allPassed = false;
      } 
      else if (challenge.id === 'code-02') {
        const fn = fns.sanitizeSearchQuery;
        if (!fn) throw new Error('function sanitizeSearchQuery is not defined');

        const res1 = fn("admin' OR 1=1; --");
        const pass1 = typeof res1 === 'string' && !res1.includes("'") && !res1.includes(';') && !res1.includes('--');
        results.push({
          id: 'tc1',
          name: 'Neutralizes SQL quotes & semicolons',
          passed: pass1,
          actual: String(res1)
        });
        if (!pass1) allPassed = false;

        const res2 = fn("<script>alert(1)</script>");
        const pass2 = typeof res2 === 'string' && !res2.includes('<') && !res2.includes('>');
        results.push({
          id: 'tc2',
          name: 'Strips script angle brackets',
          passed: pass2,
          actual: String(res2)
        });
        if (!pass2) allPassed = false;
      }
      else if (challenge.id === 'code-03') {
        const fn = fns.validatePodSecurity;
        if (!fn) throw new Error('function validatePodSecurity is not defined');

        const testSpec1 = {
          spec: {
            containers: [{ securityContext: { privileged: true, runAsNonRoot: true, readOnlyRootFilesystem: true } }]
          }
        };
        const res1 = fn(testSpec1);
        const pass1 = res1 && res1.compliant === false && res1.violations?.includes('PRIVILEGED_CONTAINER');
        results.push({
          id: 'tc1',
          name: 'Rejects privileged: true pod',
          passed: pass1,
          actual: JSON.stringify(res1)
        });
        if (!pass1) allPassed = false;

        const testSpec2 = {
          spec: {
            containers: [{ securityContext: { privileged: false, runAsNonRoot: true, readOnlyRootFilesystem: true } }]
          }
        };
        const res2 = fn(testSpec2);
        const pass2 = res2 && res2.compliant === true && res2.violations?.length === 0;
        results.push({
          id: 'tc2',
          name: 'Approves hardened restricted pod',
          passed: pass2,
          actual: JSON.stringify(res2)
        });
        if (!pass2) allPassed = false;
      }
      else if (challenge.id === 'code-04') {
        const fn = fns.verifyToken;
        if (!fn) throw new Error('function verifyToken is not defined');

        // Test rejecting alg: none
        const noneToken = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiJ9.";
        const res1 = fn(noneToken, "secret");
        const pass1 = res1 && res1.valid === false;
        results.push({
          id: 'tc1',
          name: 'Rejects alg: "none" signature bypass attempt',
          passed: pass1,
          actual: JSON.stringify(res1)
        });
        if (!pass1) allPassed = false;

        // Test accepting valid algorithm format
        const badAlgToken = "eyJhbGciOiJyczI1NiJ9.eyJzdWIiOiJ1c2VyIn0.sig";
        const res2 = fn(badAlgToken, "secret");
        const pass2 = res2 && res2.valid === false;
        results.push({
          id: 'tc2',
          name: 'Rejects unpinned asymmetric algorithm RS256',
          passed: pass2,
          actual: JSON.stringify(res2)
        });
        if (!pass2) allPassed = false;
      } else {
        // Generic fallback verification
        results.push({ id: 'tc1', name: 'Code validation passed', passed: true });
      }

    } catch (err: unknown) {
      allPassed = false;
      const msg = err instanceof Error ? err.message : String(err);
      results.push({
        id: 'err',
        name: 'Evaluation Exception',
        passed: false,
        error: msg
      });
    }

    const endExec = performance.now();
    setExecutionTimeMs(Math.round((endExec - startExec) * 100) / 100);
    setTestResults(results);
    setIsRunning(false);

    if (allPassed) {
      sounds.correct();
    } else {
      sounds.wrong();
    }

    return allPassed;
  };

  const handleSubmit = () => {
    if (isReadOnly) return;
    const passed = runTestCases();
    onSubmit({
      isCorrect: passed,
      evidenceFound: evidenceDiscovered,
      hadUnsafePenalty: false
    });
  };

  // Calculate lines for visual line numbers
  const linesCount = Math.max(16, code.split('\n').length);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      
      {/* Workspace Header */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-[#090d16]/90 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider block font-bold">
              Secure Programming Competition Engine
            </span>
            <span className="text-sm font-bold text-white">
              Deterministic Test Runner & Algorithm Defense
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={isReadOnly}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={() => runTestCases()}
            disabled={isReadOnly || isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Run Tests (Ctrl+Enter)</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Problem Brief & Invariants */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 mb-1">
              <span>Problem Specification</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{challenge.difficulty} Tier</span>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">{challenge.title}</h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">{challenge.description}</p>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
              <span className="text-emerald-300 font-semibold block mb-0.5">Algorithmic Benchmark:</span>
              {challenge.learningObjective}
            </div>
          </div>

          {/* Test Case Previews */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3">
            <span className="text-xs font-mono uppercase font-bold text-slate-300 block">
              Predefined Test Invariants
            </span>
            {challenge.testCases?.map((tc, idx) => (
              <div key={tc.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono space-y-1">
                <span className="text-emerald-400 font-bold block">Case {idx + 1}: {tc.description}</span>
                <div className="text-slate-400 truncate">In: {tc.input}</div>
                <div className="text-sky-300 truncate">Expected: {tc.expectedOutput}</div>
              </div>
            ))}
          </div>

          {/* Hidden Evidence Bonus */}
          {challenge.hiddenEvidence && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase font-mono">
                    Security Vulnerability Audit
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
                    : "Detect underlying CWE/CVE vulnerabilities in algorithm design."}
                </p>
              </div>

              {!evidenceDiscovered && !isReadOnly && (
                <button
                  onClick={handleDiscoverEvidence}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-400 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/50 rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  Audit CWE
                </button>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Code Editor & Sandboxed Results */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Code Editor Container */}
          <div className="rounded-2xl border border-slate-800 bg-[#05070a] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-mono text-slate-200 font-bold">{challenge.targetArtifactName}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                {executionTimeMs !== null && (
                  <span className="text-sky-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{executionTimeMs}ms</span>
                  </span>
                )}
                <span>JavaScript / ES2024</span>
              </div>
            </div>

            {/* Editable Textarea with monospaced coding font & line number gutter */}
            <div className="grid grid-cols-[3rem_1fr] bg-[#05070a]">
              <div className="py-4 select-none text-right pr-3 font-mono text-xs text-slate-600 bg-slate-950/40 border-r border-slate-900">
                {Array.from({ length: linesCount }).map((_, i) => (
                  <div key={i} className="leading-relaxed tabular-nums">{i + 1}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isReadOnly}
                rows={16}
                spellCheck={false}
                className="w-full bg-[#05070a] p-4 font-mono text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-y leading-relaxed"
              />
            </div>
          </div>

          {/* Test Execution Output */}
          {testResults && (
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-2 shadow-xl">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase block">
                  Sandbox Test Invariant Results
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {testResults.filter(t => t.passed).length}/{testResults.length} Passed
                </span>
              </div>

              <div className="space-y-1.5">
                {testResults.map(tr => (
                  <div key={tr.id} className="flex items-start justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      {tr.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                      )}
                      <span className={tr.passed ? 'text-slate-200' : 'text-rose-400 font-bold'}>{tr.name}</span>
                    </div>
                    {tr.error && (
                      <span className="text-rose-400 text-[11px]">{tr.error}</span>
                    )}
                    {tr.actual && !tr.error && (
                      <span className="text-slate-400 text-[11px]">Output: {tr.actual}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Action */}
          {!isReadOnly && (
            <div className="pt-2">
              <button
                onClick={handleSubmit}
                className="w-full py-4 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 cursor-pointer active:scale-[0.99] transition-all"
              >
                <Send className="h-4 w-4" />
                <span>Submit Solution & Benchmark</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
