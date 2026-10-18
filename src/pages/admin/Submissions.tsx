import { useState } from 'react';
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Cpu,
  Copy,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/layout/AdminLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/admin/ui/Table';
import { Badge, type BadgeVariant } from '../../components/admin/ui/Badge';
import { Button } from '../../components/admin/ui/Button';
import { Modal } from '../../components/admin/ui/Modal';
import { Tabs } from '../../components/admin/ui/Tabs';
import { EmptyState } from '../../components/admin/ui/EmptyState';
import { adminDataService } from '../../services/adminDataService';
import { useToast } from '../../context/ToastContext';
import type { Submission, SubmissionStatus } from '../../types/admin';

export default function Submissions() {
  const { showToast } = useToast();

  const [submissions] = useState<Submission[]>(() =>
    adminDataService.getSubmissions()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRound, setSelectedRound] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  // Detail Modal
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [detailTab, setDetailTab] = useState<'code' | 'testcases' | 'evaluation'>('code');

  const filtered = submissions.filter((sub) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !sub.participantName.toLowerCase().includes(q) &&
        !sub.questionTitle.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (selectedRound !== 'all' && sub.round !== selectedRound) return false;
    if (selectedStatus !== 'all' && sub.status !== selectedStatus) return false;
    if (selectedLanguage !== 'all' && sub.language !== selectedLanguage) return false;
    return true;
  });

  const getStatusBadge = (status: SubmissionStatus) => {
    const config: Record<SubmissionStatus, { variant: BadgeVariant; label: string; dot?: boolean }> = {
      accepted: { variant: 'success', label: 'Accepted', dot: true },
      partial: { variant: 'warning', label: 'Partial' },
      wrong_answer: { variant: 'error', label: 'Wrong Answer' },
      time_limit_exceeded: { variant: 'warning', label: 'Time Limit Exceeded' },
      compilation_error: { variant: 'error', label: 'Compilation Error' },
      runtime_error: { variant: 'error', label: 'Runtime Error' },
      evaluating: { variant: 'info', label: 'Evaluating...', dot: true },
      pending: { variant: 'neutral', label: 'Pending' },
    };
    const s = config[status] || { variant: 'neutral', label: status };
    return <Badge variant={s.variant} size="sm" dot={s.dot}>{s.label}</Badge>;
  };

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast('Source code copied to clipboard.', 'info');
  };

  const detailTabs = [
    { id: 'code', label: 'Submitted Code' },
    { id: 'testcases', label: 'Test Cases' },
    { id: 'evaluation', label: 'Evaluation Results' },
  ];

  return (
    <AdminLayout
      title="Submissions & Evaluation"
      subtitle="Inspect candidate code submissions, test assertions, and sandboxed execution logs."
    >
      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3.5 rounded-lg border border-[#272B49] bg-[#13162D]">
          <span className="text-[10px] text-[#737D9D] uppercase tracking-wider block font-semibold">
            Total Submissions
          </span>
          <span className="text-xl font-bold font-mono text-[#F8FAFC]">
            8,945
          </span>
        </div>
        <div className="p-3.5 rounded-lg border border-[#272B49] bg-[#13162D]">
          <span className="text-[10px] text-[#737D9D] uppercase tracking-wider block font-semibold">
            Accepted Solves
          </span>
          <span className="text-xl font-bold font-mono text-[#10B981]">
            6,412 (71.6%)
          </span>
        </div>
        <div className="p-3.5 rounded-lg border border-[#272B49] bg-[#13162D]">
          <span className="text-[10px] text-[#737D9D] uppercase tracking-wider block font-semibold">
            Active Evaluator Workers
          </span>
          <span className="text-xl font-bold font-mono text-[#8B5CF6]">
            16 / 16 Healthy
          </span>
        </div>
        <div className="p-3.5 rounded-lg border border-[#272B49] bg-[#13162D]">
          <span className="text-[10px] text-[#737D9D] uppercase tracking-wider block font-semibold">
            Avg Execution Latency
          </span>
          <span className="text-xl font-bold font-mono text-[#3B82F6]">
            142ms
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#13162D] border border-[#272B49] rounded-xl p-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#737D9D]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name or question..."
            className="w-full bg-[#0D1024] border border-[#272B49] focus:border-[#7C3AED] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F8FAFC] placeholder-[#737D9D] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto text-xs">
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="bg-[#0D1024] border border-[#272B49] rounded-lg px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
          >
            <option value="all">All Rounds</option>
            <option value="Quiz Battle">Quiz Battle</option>
            <option value="Coding Battle">Coding Battle</option>
            <option value="Debugging Battle">Debugging Battle</option>
            <option value="Final Battle">Final Battle</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0D1024] border border-[#272B49] rounded-lg px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
          >
            <option value="all">All Verdicts</option>
            <option value="accepted">Accepted</option>
            <option value="partial">Partial</option>
            <option value="wrong_answer">Wrong Answer</option>
            <option value="time_limit_exceeded">Time Limit Exceeded</option>
            <option value="evaluating">Evaluating</option>
          </select>

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-[#0D1024] border border-[#272B49] rounded-lg px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
          >
            <option value="all">All Languages</option>
            <option value="C++">C++</option>
            <option value="Python">Python</option>
            <option value="Rust">Rust</option>
            <option value="Java">Java</option>
            <option value="Go">Go</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No submissions match filters"
          description="Try broadening your filter criteria."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Question Challenge</TableHead>
              <TableHead>Round</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div>
                    <span className="font-semibold text-[#F8FAFC] block">{sub.participantName}</span>
                    <span className="text-[11px] text-[#737D9D] font-mono">{sub.participantEmail}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-[#F8FAFC] font-medium">{sub.questionTitle}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="purple" size="sm">{sub.round}</Badge>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-[#A5ADCA] bg-[#0D1024] border border-[#272B49] px-2 py-0.5 rounded">
                    {sub.language}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-[#A5ADCA]">
                    {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(sub.status)}</TableCell>
                <TableCell>
                  <span className="font-mono font-bold text-xs text-[#10B981]">
                    {sub.score} / {sub.maxScore}
                  </span>
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSubmission(sub);
                      setDetailTab('code');
                    }}
                    icon={<Eye className="h-3 w-3" />}
                  >
                    Inspect
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <Modal
          isOpen={Boolean(selectedSubmission)}
          onClose={() => setSelectedSubmission(null)}
          title={`Submission #${selectedSubmission.id}`}
          subtitle={`${selectedSubmission.participantName} • ${selectedSubmission.questionTitle} (${selectedSubmission.language})`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#737D9D]">Verdict:</span>
                {getStatusBadge(selectedSubmission.status)}
                <span className="font-mono font-bold text-xs text-[#10B981] ml-2">
                  Score: {selectedSubmission.score} / {selectedSubmission.maxScore}
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedSubmission(null)}
              >
                Close Inspector
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Modal Tabs */}
            <Tabs
              tabs={detailTabs}
              activeTab={detailTab}
              onChange={(tabId) => setDetailTab(tabId as any)}
            />

            {/* TAB 1: Submitted Code */}
            {detailTab === 'code' && (
              <div className="space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A5ADCA] font-mono">
                    Language: {selectedSubmission.language}
                  </span>
                  <button
                    onClick={() => copyCodeToClipboard(selectedSubmission.code)}
                    className="flex items-center gap-1 text-[11px] text-[#8B5CF6] hover:text-[#A78BFA]"
                  >
                    <Copy className="h-3 w-3" />
                    Copy Code
                  </button>
                </div>

                <div className="rounded-lg bg-[#0D1024] border border-[#272B49] p-4 overflow-x-auto max-h-96">
                  <pre className="font-mono text-xs text-[#F8FAFC] leading-relaxed">
                    {selectedSubmission.code}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 2: Test Cases */}
            {detailTab === 'testcases' && (
              <div className="space-y-2.5 text-xs animate-in fade-in">
                {selectedSubmission.testCaseResults.length === 0 ? (
                  <p className="text-xs text-[#737D9D] p-4 text-center">
                    Evaluation in progress or no granular test cases recorded.
                  </p>
                ) : (
                  selectedSubmission.testCaseResults.map((tc) => (
                    <div
                      key={tc.testCaseId}
                      className="p-3 rounded-lg border border-[#272B49] bg-[#0D1024] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        {tc.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-[#EF4444] shrink-0" />
                        )}
                        <div>
                          <span className="font-semibold text-[#F8FAFC] block">{tc.name}</span>
                          {tc.error && (
                            <span className="text-[11px] text-[#EF4444] font-mono">{tc.error}</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right text-[11px] font-mono text-[#A5ADCA]">
                        <div>{tc.executionTimeMs}ms</div>
                        <div className="text-[#737D9D]">{tc.memoryMb}MB</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: Evaluation Results */}
            {detailTab === 'evaluation' && (
              <div className="space-y-3.5 text-xs animate-in fade-in">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-[#272B49] bg-[#0D1024]">
                    <span className="text-[10px] text-[#737D9D] uppercase block">
                      Execution Runtime
                    </span>
                    <span className="text-base font-bold font-mono text-[#F8FAFC]">
                      {selectedSubmission.executionTimeMs} ms
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-[#272B49] bg-[#0D1024]">
                    <span className="text-[10px] text-[#737D9D] uppercase block">
                      Memory Consumed
                    </span>
                    <span className="text-base font-bold font-mono text-[#F8FAFC]">
                      {selectedSubmission.memoryMb} MB
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-[#272B49] bg-[#0D1024]">
                    <span className="text-[10px] text-[#737D9D] uppercase block">
                      Isolated Sandbox
                    </span>
                    <span className="text-xs font-semibold text-[#10B981] flex items-center gap-1 mt-1">
                      <Cpu className="h-3.5 w-3.5" /> Docker gVisor
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-[#F8FAFC] mb-1 block">
                    Compiler &amp; Sandbox Output
                  </span>
                  <div className="rounded-lg bg-[#0D1024] border border-[#272B49] p-3 font-mono text-[11px] text-[#10B981]">
                    {selectedSubmission.compilerOutput || 'Process exited with code 0.'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
