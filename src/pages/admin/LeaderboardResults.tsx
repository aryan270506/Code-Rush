import { useState } from 'react';
import {
  Download,
  Share2,
  Lock,
  Search,
  Eye,
  Trophy,
  Medal,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/layout/AdminLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/admin/ui/Table';
import { Badge } from '../../components/admin/ui/Badge';
import { Button } from '../../components/admin/ui/Button';
import { Card, CardBody } from '../../components/admin/ui/Card';
import { Tabs } from '../../components/admin/ui/Tabs';
import { Modal } from '../../components/admin/ui/Modal';
import { ConfirmDialog } from '../../components/admin/ui/ConfirmDialog';
import { EmptyState } from '../../components/admin/ui/EmptyState';
import { adminDataService } from '../../services/adminDataService';
import { useToast } from '../../context/ToastContext';
import type { LeaderboardEntry } from '../../types/admin';

export default function LeaderboardResults() {
  const { showToast } = useToast();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() =>
    adminDataService.getLeaderboard()
  );
  const [pubStatus, setPubStatus] = useState(() =>
    adminDataService.getPublicationStatus()
  );
  const [activeTab, setActiveTab] = useState<'live' | 'roundwise' | 'final'>('live');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [unpublishConfirmOpen, setUnpublishConfirmOpen] = useState(false);

  const refreshStatus = () => {
    setPubStatus(adminDataService.getPublicationStatus());
    setLeaderboard(adminDataService.getLeaderboard());
  };

  const filtered = leaderboard.filter((entry) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!entry.name.toLowerCase().includes(q) && !entry.email.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handlePublish = () => {
    const res = adminDataService.publishResults();
    setPubStatus(res);
    setPublishConfirmOpen(false);
    showToast('Final competition results are now published live to participants!', 'success');
  };

  const handleUnpublish = () => {
    adminDataService.unpublishResults();
    refreshStatus();
    setUnpublishConfirmOpen(false);
    showToast('Published leaderboard retracted back to draft.', 'info');
  };

  const handleExport = () => {
    const csvData = adminDataService.generateCSV('leaderboard');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `codebattle_leaderboard_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Leaderboard standings exported as CSV.', 'info');
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 font-bold text-xs text-[#F59E0B]">
          <Trophy className="h-4 w-4" /> #1 Gold
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 font-bold text-xs text-slate-300">
          <Medal className="h-4 w-4" /> #2 Silver
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 font-bold text-xs text-amber-600">
          <Medal className="h-4 w-4" /> #3 Bronze
        </span>
      );
    }
    return <span className="font-mono text-xs font-semibold text-[#737D9D]">#{rank}</span>;
  };

  const tabs = [
    { id: 'live', label: 'Live Leaderboard' },
    { id: 'roundwise', label: 'Round-wise Breakdown' },
    { id: 'final', label: 'Final Results (Official)' },
  ];

  return (
    <AdminLayout
      title="Leaderboard & Results"
      subtitle="Monitor live competitor standings, resolve tie-breakers, and officially publish results."
      action={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            icon={<Download className="h-4 w-4" />}
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPreviewModalOpen(true)}
            icon={<Eye className="h-4 w-4" />}
          >
            Preview Results
          </Button>
          {pubStatus.published ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setUnpublishConfirmOpen(true)}
              icon={<Lock className="h-4 w-4" />}
            >
              Unpublish
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPublishConfirmOpen(true)}
              icon={<Share2 className="h-4 w-4" />}
            >
              Publish Final Results
            </Button>
          )}
        </div>
      }
    >
      {/* Official Publication Status Bar */}
      <Card
        className={`mb-6 border-l-4 ${
          pubStatus.published
            ? 'border-l-[#10B981] bg-gradient-to-r from-[#10B981]/10 to-[#13162D]'
            : 'border-l-[#F59E0B] bg-gradient-to-r from-[#F59E0B]/10 to-[#13162D]'
        }`}
      >
        <CardBody className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {pubStatus.published ? (
              <div className="h-9 w-9 rounded-lg bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            ) : (
              <div className="h-9 w-9 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#F8FAFC]">
                  {pubStatus.published
                    ? 'Final Results Officially Published'
                    : 'Results in Draft State (Unpublished)'}
                </h3>
                <Badge variant={pubStatus.published ? 'success' : 'warning'} size="sm" dot>
                  {pubStatus.published ? 'Publicly Live' : 'Internal Only'}
                </Badge>
              </div>
              <p className="text-xs text-[#A5ADCA] mt-0.5">
                {pubStatus.published
                  ? `Published on ${new Date(pubStatus.publishedAt || '').toLocaleString()} by ${pubStatus.publisher}. Participants can view final ranks.`
                  : 'Leaderboard is currently confidential and visible only to authorized judges and administrators.'}
              </p>
            </div>
          </div>

          {!pubStatus.published && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPublishConfirmOpen(true)}
            >
              Publish Now
            </Button>
          )}
        </CardBody>
      </Card>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as any)}
        />

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#737D9D]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name or email..."
            className="w-full bg-[#13162D] border border-[#272B49] focus:border-[#7C3AED] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F8FAFC] placeholder-[#737D9D] focus:outline-none"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No candidates found"
          description="Try modifying your search query."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead>Total Score</TableHead>
              <TableHead>Quiz Battle</TableHead>
              <TableHead>Coding Battle</TableHead>
              <TableHead>Debugging</TableHead>
              <TableHead>Final Battle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tie-breaker Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((entry) => (
              <TableRow key={entry.participantId}>
                <TableCell>{getRankBadge(entry.rank)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-[#191B38] border border-[#272B49] flex items-center justify-center font-bold text-xs text-[#8B5CF6]">
                      {entry.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-semibold text-[#F8FAFC] block">{entry.name}</span>
                      <span className="text-[11px] text-[#737D9D] font-mono">{entry.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono font-bold text-xs text-[#10B981]">
                    {entry.totalScore} pts
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-[#A5ADCA]">{entry.quizScore}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-[#A5ADCA]">{entry.codingScore}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-[#A5ADCA]">{entry.debuggingScore}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-[#A5ADCA]">{entry.finalScore}</span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      entry.qualificationStatus === 'qualified'
                        ? 'bright'
                        : entry.qualificationStatus === 'in_review'
                        ? 'warning'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {entry.qualificationStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  {entry.tieBreakerNote ? (
                    <span className="text-[11px] text-[#8B5CF6] font-mono bg-[#6D28D9]/15 px-2 py-0.5 rounded border border-[#6D28D9]/30">
                      {entry.tieBreakerNote}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#737D9D]">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Preview Modal for Public Leaderboard */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Public Participant Leaderboard Preview"
        subtitle="This is how competitor standings will appear on the public hackathon portal."
        maxWidth="xl"
        footer={
          <Button variant="outline" size="sm" onClick={() => setPreviewModalOpen(false)}>
            Close Preview
          </Button>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#6D28D9]/20 via-[#13162D] to-[#13162D] border border-[#7C3AED]/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-[#F59E0B]" />
              <div>
                <h4 className="text-sm font-bold text-[#F8FAFC]">Code Battle 2026 Official Standings</h4>
                <p className="text-[11px] text-[#A5ADCA]">Live real-time ranking based on automated sandbox tests.</p>
              </div>
            </div>
            <Badge variant="success" size="sm">
              Live Verified
            </Badge>
          </div>

          <div className="divide-y divide-[#272B49] border border-[#272B49] rounded-lg bg-[#0D1024]">
            {leaderboard.slice(0, 3).map((l) => (
              <div key={l.participantId} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold font-mono text-sm text-[#F59E0B]">
                    #{l.rank}
                  </span>
                  <div>
                    <span className="font-semibold text-[#F8FAFC] block">{l.name}</span>
                    <span className="text-[10px] text-[#737D9D] font-mono">{l.email}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-[#10B981] block">
                    {l.totalScore} pts
                  </span>
                  <span className="text-[10px] text-[#8B5CF6]">Qualified Finalist</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={publishConfirmOpen}
        onClose={() => setPublishConfirmOpen(false)}
        onConfirm={handlePublish}
        title="Publish Official Results"
        description="Are you sure you want to officially publish the final competition results? All participant dashboards will immediately display final placements, scores, and qualification statuses."
        variant="primary"
        confirmLabel="Publish to Participants"
      />

      <ConfirmDialog
        isOpen={unpublishConfirmOpen}
        onClose={() => setUnpublishConfirmOpen(false)}
        onConfirm={handleUnpublish}
        title="Unpublish Results"
        description="Are you sure you want to retract published results back to draft state? The public leaderboard will become hidden from participants."
        variant="warning"
        confirmLabel="Unpublish"
      />
    </AdminLayout>
  );
}
