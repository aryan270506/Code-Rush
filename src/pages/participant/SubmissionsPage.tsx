import React, { useState } from "react";
import {
  FileCode2,
  Eye,
  X,
  Copy,
  Check,
} from "lucide-react";
import { useSubmissions } from "../../hooks/useParticipantData";
import { StatusBadge } from "../../components/participant/StatusBadge";
import type { CodeSubmission } from "../../types/participant";

export const SubmissionsPage: React.FC = () => {
  const { submissions } = useSubmissions();
  const [selectedRound, setSelectedRound] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeModalSub, setActiveModalSub] = useState<CodeSubmission | null>(null);
  const [copied, setCopied] = useState(false);

  // Filter submissions
  const filtered = submissions.filter((s) => {
    if (selectedRound !== "all" && String(s.roundId) !== selectedRound) return false;
    if (selectedStatus !== "all" && s.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
    return true;
  });

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-border bg-bg-card/70 p-6 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-violet-light uppercase tracking-wider mb-1">
            <FileCode2 className="h-4 w-4" />
            <span>Judging Logs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            My Submissions
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Audit history of your code attempts, runtime performance, and judging verdicts.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Round Filter */}
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="rounded-xl border border-border bg-bg-secondary px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-violet-primary cursor-pointer"
          >
            <option value="all">All Rounds</option>
            <option value="2">Round 2: Coding</option>
            <option value="3">Round 3: Debugging</option>
            <option value="4">Round 4: Final</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-border bg-bg-secondary px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-violet-primary cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="accepted">Accepted</option>
            <option value="wrong answer">Wrong Answer</option>
            <option value="time limit exceeded">Time Limit Exceeded</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="rounded-3xl border border-border bg-bg-card/50 backdrop-blur-md overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileCode2 className="h-10 w-10 text-text-muted mx-auto" />
            <h3 className="text-sm font-bold text-text-primary">No submissions found</h3>
            <p className="text-xs text-text-secondary">
              Try adjusting your filter settings or submit a solution in Round 2.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#08081a] border-b border-border text-[11px] font-mono uppercase text-text-muted">
                <tr>
                  <th className="px-5 py-3.5">Submission ID</th>
                  <th className="px-5 py-3.5">Problem</th>
                  <th className="px-4 py-3.5">Round</th>
                  <th className="px-4 py-3.5">Language</th>
                  <th className="px-4 py-3.5">Verdict</th>
                  <th className="px-4 py-3.5 text-center">Score</th>
                  <th className="px-4 py-3.5 text-center">Time / Mem</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-bg-card-hover transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-violet-light">
                      {sub.id}
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-bold text-text-primary block">
                        {sub.problemTitle}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted">
                        Submitted {new Date(sub.submittedAt).toLocaleTimeString()}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-text-secondary font-mono">
                      Round {sub.roundId}
                    </td>

                    <td className="px-4 py-4 font-mono uppercase text-text-muted">
                      {sub.language}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={sub.status} size="sm" />
                    </td>

                    <td className="px-4 py-4 text-center font-mono font-bold text-cyan-light">
                      {sub.score} / {sub.maxScore}
                    </td>

                    <td className="px-4 py-4 text-center font-mono text-text-muted text-[11px]">
                      {sub.executionTimeMs}ms • {sub.memoryUsedMB}MB
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveModalSub(sub)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-bg-card hover:bg-bg-card-hover text-text-primary transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5 text-violet-light" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Code & Details Inspection Modal */}
      {activeModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm"
            onClick={() => setActiveModalSub(null)}
          />

          <div className="relative w-full max-w-3xl rounded-3xl border border-border bg-bg-secondary p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="font-mono text-xs font-bold text-violet-light uppercase">
                  {activeModalSub.id} • Round {activeModalSub.roundId}
                </span>
                <h3 className="text-lg font-bold text-text-primary mt-0.5">
                  {activeModalSub.problemTitle}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalSub(null)}
                className="rounded-lg p-1.5 text-text-muted hover:bg-bg-card hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Verdict summary */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono bg-bg-card p-3 rounded-xl border border-border">
              <StatusBadge status={activeModalSub.status} size="sm" />
              <span>Score: {activeModalSub.score} / {activeModalSub.maxScore}</span>
              <span>Time: {activeModalSub.executionTimeMs}ms</span>
              <span>Memory: {activeModalSub.memoryUsedMB}MB</span>
              <span>Lang: {activeModalSub.language.toUpperCase()}</span>
            </div>

            {/* Code View */}
            <div>
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-mono font-bold text-text-muted uppercase">
                  Submitted Code
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(activeModalSub.code)}
                  className="inline-flex items-center gap-1 text-xs text-violet-light hover:underline cursor-pointer"
                >
                  {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? "Copied" : "Copy Code"}</span>
                </button>
              </div>

              <pre className="rounded-2xl border border-border bg-[#070714] p-4 font-mono text-xs sm:text-sm text-text-primary overflow-x-auto leading-relaxed max-h-72">
                {activeModalSub.code}
              </pre>
            </div>

            {/* Compiler / Judge Logs */}
            {activeModalSub.compilerOutput && (
              <div>
                <span className="text-xs font-mono font-bold text-text-muted uppercase block mb-2">
                  Judge Output &amp; Diagnostics
                </span>
                <pre className="rounded-xl border border-border bg-[#050510] p-3 font-mono text-xs text-cyan-light overflow-x-auto leading-relaxed">
                  {activeModalSub.compilerOutput}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsPage;
