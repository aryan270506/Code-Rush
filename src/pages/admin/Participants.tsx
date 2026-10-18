import { useState } from 'react';
import {
  Search,
  Download,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Layers,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/layout/AdminLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/admin/ui/Table';
import { Badge, type BadgeVariant } from '../../components/admin/ui/Badge';
import { Button } from '../../components/admin/ui/Button';
import { Modal } from '../../components/admin/ui/Modal';
import { ConfirmDialog } from '../../components/admin/ui/ConfirmDialog';
import { EmptyState } from '../../components/admin/ui/EmptyState';
import { adminDataService } from '../../services/adminDataService';
import { useToast } from '../../context/ToastContext';
import type { Participant, AccountStatus, QualificationStatus } from '../../types/admin';

export default function Participants() {
  const { showToast } = useToast();

  const [participants, setParticipants] = useState<Participant[]>(() =>
    adminDataService.getParticipants()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRound, setSelectedRound] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedQual, setSelectedQual] = useState<string>('all');

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Detail Modal
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
    variant: 'danger' | 'warning' | 'primary';
    confirmLabel?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    action: () => {},
    variant: 'danger',
  });

  const refreshList = () => {
    setParticipants(adminDataService.getParticipants());
  };

  // Filtered participants
  const filtered = participants.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.email.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedRound !== 'all' && p.currentRound !== selectedRound) return false;
    if (selectedStatus !== 'all' && p.accountStatus !== selectedStatus) return false;
    if (selectedQual !== 'all' && p.qualificationStatus !== selectedQual) return false;
    return true;
  });

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = (status: AccountStatus) => {
    if (selectedIds.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: `Bulk Update (${selectedIds.length} Participants)`,
      description: `Are you sure you want to change the status of ${selectedIds.length} selected participant accounts to ${status.toUpperCase()}?`,
      variant: status === 'suspended' ? 'danger' : 'warning',
      confirmLabel: `Set ${status}`,
      action: () => {
        adminDataService.bulkUpdateParticipants(selectedIds, status);
        showToast(`Updated ${selectedIds.length} participants to ${status}.`, 'success');
        setSelectedIds([]);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        refreshList();
      },
    });
  };

  const handleSingleStatusChange = (p: Participant, nextStatus: AccountStatus) => {
    adminDataService.updateParticipantStatus(p.id, nextStatus);
    showToast(`Participant ${p.name} account is now ${nextStatus}.`, 'success');
    refreshList();
    if (selectedParticipant?.id === p.id) {
      setSelectedParticipant({ ...p, accountStatus: nextStatus });
    }
  };

  const handleExportCSV = () => {
    const csvData = adminDataService.generateCSV('participants');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `codebattle_participants_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Participant dataset exported as CSV.', 'info');
  };

  const getStatusBadge = (status: AccountStatus) => {
    const map: Record<AccountStatus, { variant: BadgeVariant; label: string }> = {
      active: { variant: 'success', label: 'Active' },
      inactive: { variant: 'neutral', label: 'Inactive' },
      suspended: { variant: 'error', label: 'Suspended' },
    };
    const s = map[status];
    return <Badge variant={s.variant} size="sm">{s.label}</Badge>;
  };

  const getQualBadge = (qual: QualificationStatus) => {
    const map: Record<QualificationStatus, { variant: BadgeVariant; label: string }> = {
      qualified: { variant: 'bright', label: 'Qualified' },
      in_review: { variant: 'warning', label: 'In Review' },
      knocked_out: { variant: 'neutral', label: 'Knocked Out' },
      disqualified: { variant: 'error', label: 'Disqualified' },
    };
    const q = map[qual];
    return <Badge variant={q.variant} size="sm">{q.label}</Badge>;
  };

  return (
    <AdminLayout
      title="Participants"
      subtitle="View, verify, and govern hackathon competitors across tournament rounds."
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          icon={<Download className="h-4 w-4" />}
        >
          Export CSV ({filtered.length})
        </Button>
      }
    >
      {/* Search & Filter Controls */}
      <div className="bg-[#13162D] border border-[#272B49] rounded-xl p-4 mb-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#737D9D]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by participant name or email..."
              className="w-full bg-[#0D1024] border border-[#272B49] focus:border-[#7C3AED] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F8FAFC] placeholder-[#737D9D] focus:outline-none"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto text-xs">
            <div className="flex items-center gap-1.5 shrink-0 text-[#737D9D]">
              <Filter className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium">Filters:</span>
            </div>

            {/* Round filter */}
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

            {/* Account Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#0D1024] border border-[#272B49] rounded-lg px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
            >
              <option value="all">All Account States</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            {/* Qualification Status */}
            <select
              value={selectedQual}
              onChange={(e) => setSelectedQual(e.target.value)}
              className="bg-[#0D1024] border border-[#272B49] rounded-lg px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
            >
              <option value="all">All Qualifications</option>
              <option value="qualified">Qualified</option>
              <option value="in_review">In Review</option>
              <option value="knocked_out">Knocked Out</option>
              <option value="disqualified">Disqualified</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar (Visible when rows selected) */}
        {selectedIds.length > 0 && (
          <div className="pt-3 border-t border-[#272B49] flex items-center justify-between text-xs animate-in fade-in">
            <span className="text-[#8B5CF6] font-medium">
              {selectedIds.length} participant{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusChange('active')}
                icon={<UserCheck className="h-3 w-3 text-[#10B981]" />}
              >
                Activate
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleBulkStatusChange('suspended')}
                icon={<UserX className="h-3 w-3" />}
              >
                Suspend
              </Button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-[#737D9D] hover:text-[#F8FAFC] ml-2"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Participants Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No participants found"
          description="Try clearing filters or search queries to view competitors."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead width="40px">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-[#272B49] text-[#6D28D9] focus:ring-[#7C3AED] h-3.5 w-3.5 bg-[#0D1024] cursor-pointer"
                />
              </TableHead>
              <TableHead>Participant</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Current Round</TableHead>
              <TableHead>Total Score</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <TableRow key={p.id} selected={isSelected}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(p.id)}
                      className="rounded border-[#272B49] text-[#6D28D9] focus:ring-[#7C3AED] h-3.5 w-3.5 bg-[#0D1024] cursor-pointer"
                    />
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center gap-2.5 cursor-pointer"
                      onClick={() => setSelectedParticipant(p)}
                    >
                      <div className="h-7 w-7 rounded-full bg-[#191B38] border border-[#272B49] flex items-center justify-center font-bold text-[11px] text-[#8B5CF6] shrink-0">
                        {p.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-[#F8FAFC] hover:text-[#8B5CF6] transition-colors">
                        {p.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-[#A5ADCA] font-mono">{p.email}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="purple" size="sm">
                      {p.currentRound}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-[#10B981]">
                      {p.totalScore} pts
                    </span>
                  </TableCell>
                  <TableCell>{getQualBadge(p.qualificationStatus)}</TableCell>
                  <TableCell>{getStatusBadge(p.accountStatus)}</TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedParticipant(p)}
                        title="View Detailed Profile"
                        className="p-1.5 rounded-lg text-[#A5ADCA] hover:text-[#F8FAFC] hover:bg-[#191B38] transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>

                      {p.accountStatus === 'suspended' ? (
                        <button
                          onClick={() => handleSingleStatusChange(p, 'active')}
                          title="Activate Account"
                          className="p-1.5 rounded-lg text-[#10B981] hover:bg-[#10B981]/15 transition-colors"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSingleStatusChange(p, 'suspended')}
                          title="Suspend Account"
                          className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/15 transition-colors"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Participant Detail Modal / Drawer */}
      {selectedParticipant && (
        <Modal
          isOpen={Boolean(selectedParticipant)}
          onClose={() => setSelectedParticipant(null)}
          title={
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#6D28D9] flex items-center justify-center font-bold text-xs text-[#F8FAFC]">
                {selectedParticipant.name.charAt(0)}
              </div>
              <div>
                <span>{selectedParticipant.name}</span>
                <span className="block text-[11px] font-normal text-[#A5ADCA]">
                  {selectedParticipant.email} • ID: {selectedParticipant.id}
                </span>
              </div>
            </div>
          }
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#737D9D]">Account Status:</span>
                {selectedParticipant.accountStatus === 'suspended' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSingleStatusChange(selectedParticipant, 'active')}
                    icon={<UserCheck className="h-3.5 w-3.5 text-[#10B981]" />}
                  >
                    Reactivate Account
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleSingleStatusChange(selectedParticipant, 'suspended')}
                    icon={<UserX className="h-3.5 w-3.5" />}
                  >
                    Suspend Candidate
                  </Button>
                )}
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedParticipant(null)}
              >
                Close Drawer
              </Button>
            </div>
          }
        >
          <div className="space-y-5 text-xs">
            {/* Quick KPI stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border border-[#272B49] bg-[#0D1024]">
                <span className="text-[10px] text-[#737D9D] uppercase tracking-wider block">
                  Total Score
                </span>
                <span className="text-lg font-bold font-mono text-[#10B981]">
                  {selectedParticipant.totalScore}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-[#272B49] bg-[#0D1024]">
                <span className="text-[10px] text-[#737D9D] uppercase tracking-wider block">
                  Current Round
                </span>
                <span className="text-xs font-semibold text-[#8B5CF6]">
                  {selectedParticipant.currentRound}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-[#272B49] bg-[#0D1024]">
                <span className="text-[10px] text-[#737D9D] uppercase tracking-wider block">
                  Qualification
                </span>
                <div className="mt-0.5">{getQualBadge(selectedParticipant.qualificationStatus)}</div>
              </div>
              <div className="p-3 rounded-lg border border-[#272B49] bg-[#0D1024]">
                <span className="text-[10px] text-[#737D9D] uppercase tracking-wider block">
                  Submissions
                </span>
                <span className="text-lg font-bold font-mono text-[#F8FAFC]">
                  {selectedParticipant.submissionsCount}
                </span>
              </div>
            </div>

            {/* Round Breakdown */}
            <div>
              <h4 className="text-xs font-semibold text-[#F8FAFC] mb-2 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#8B5CF6]" />
                Tournament Round Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg border border-[#272B49] bg-[#0D1024] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#F8FAFC] block">Round 1: Quiz Battle</span>
                    <span className="text-[11px] text-[#737D9D]">MCQs &amp; Timed questions</span>
                  </div>
                  <span className="font-mono font-bold text-[#F8FAFC]">
                    {selectedParticipant.roundScores.quiz} / 100
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-[#272B49] bg-[#0D1024] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#F8FAFC] block">Round 2: Coding Battle</span>
                    <span className="text-[11px] text-[#737D9D]">Algorithmic challenges</span>
                  </div>
                  <span className="font-mono font-bold text-[#F8FAFC]">
                    {selectedParticipant.roundScores.coding} / 300
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-[#272B49] bg-[#0D1024] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#F8FAFC] block">Round 3: Debugging Battle</span>
                    <span className="text-[11px] text-[#737D9D]">Fix code bugs &amp; memory races</span>
                  </div>
                  <span className="font-mono font-bold text-[#F8FAFC]">
                    {selectedParticipant.roundScores.debugging} / 200
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-[#272B49] bg-[#0D1024] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#F8FAFC] block">Round 4: Final Battle</span>
                    <span className="text-[11px] text-[#737D9D]">Championship optimization</span>
                  </div>
                  <span className="font-mono font-bold text-[#F8FAFC]">
                    {selectedParticipant.roundScores.final} / 400
                  </span>
                </div>
              </div>
            </div>

            {/* Assessment & Verification Log */}
            <div className="p-3.5 rounded-lg border border-[#272B49] bg-[#0D1024]/70 space-y-2">
              <span className="text-[11px] font-semibold text-[#A5ADCA] block">
                Verification &amp; Security Meta
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#737D9D]">
                <div>Registered: {new Date(selectedParticipant.registrationDate).toLocaleDateString()}</div>
                <div>Last Active: {selectedParticipant.lastActive}</div>
                <div>Plagiarism Flag: Clean (0% match)</div>
                <div>ID Verification: Passed Automated Check</div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmLabel={confirmDialog.confirmLabel}
      />
    </AdminLayout>
  );
}
