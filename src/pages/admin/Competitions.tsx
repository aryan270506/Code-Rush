import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Play,
  Square,
  XCircle,
  Users,
  Trophy,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/layout/AdminLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/admin/ui/Table';
import { Badge, type BadgeVariant } from '../../components/admin/ui/Badge';
import { Button } from '../../components/admin/ui/Button';
import { Modal } from '../../components/admin/ui/Modal';
import { ConfirmDialog } from '../../components/admin/ui/ConfirmDialog';
import { Tabs } from '../../components/admin/ui/Tabs';
import { EmptyState } from '../../components/admin/ui/EmptyState';
import { adminDataService } from '../../services/adminDataService';
import { useToast } from '../../context/ToastContext';
import type { Competition, CompetitionStatus, RoundName } from '../../types/admin';

export default function Competitions() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [competitions, setCompetitions] = useState<Competition[]>(() =>
    adminDataService.getCompetitions()
  );
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalCompetition, setViewModalCompetition] = useState<Competition | null>(null);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);

  // Confirm dialog state
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

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    rules: '',
    currentRound: 'Quiz Battle' as RoundName,
    durationHours: 36,
    maxTeams: 1000,
  });

  const refreshList = () => {
    setCompetitions(adminDataService.getCompetitions());
  };

  // Filter logic
  const filtered = competitions.filter((comp) => {
    if (activeTab !== 'all' && comp.status !== activeTab) return false;
    if (
      searchQuery &&
      !comp.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !comp.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: CompetitionStatus) => {
    const config: Record<CompetitionStatus, { variant: BadgeVariant; label: string; dot?: boolean }> = {
      live: { variant: 'success', label: 'Live', dot: true },
      scheduled: { variant: 'bright', label: 'Scheduled' },
      draft: { variant: 'neutral', label: 'Draft' },
      completed: { variant: 'purple', label: 'Completed' },
      cancelled: { variant: 'error', label: 'Cancelled' },
    };
    const s = config[status] || { variant: 'neutral', label: status };
    return (
      <Badge variant={s.variant} size="sm" dot={s.dot}>
        {s.label}
      </Badge>
    );
  };

  const handleOpenCreate = () => {
    setEditingCompetition(null);
    setFormData({
      title: '',
      description: '',
      startDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 172800000).toISOString().slice(0, 16),
      registrationDeadline: new Date().toISOString().slice(0, 16),
      rules: 'Standard 4-round elimination. Round 1 Quiz, Round 2 Algorithms, Round 3 Debugging, Round 4 Final.',
      currentRound: 'Quiz Battle',
      durationHours: 36,
      maxTeams: 1000,
    });
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (comp: Competition) => {
    setEditingCompetition(comp);
    setFormData({
      title: comp.title,
      description: comp.description,
      startDate: comp.startDate.slice(0, 16),
      endDate: comp.endDate.slice(0, 16),
      registrationDeadline: comp.registrationDeadline.slice(0, 16),
      rules: comp.rules,
      currentRound: comp.currentRound,
      durationHours: comp.durationHours,
      maxTeams: comp.maxTeams || 1000,
    });
    setCreateModalOpen(true);
  };

  const handleSaveCompetition = (status: CompetitionStatus) => {
    if (!formData.title.trim()) {
      showToast('Competition title is required.', 'error');
      return;
    }

    if (editingCompetition) {
      adminDataService.updateCompetition(editingCompetition.id, {
        ...formData,
        status,
      });
      showToast(`Updated '${formData.title}' successfully.`, 'success');
    } else {
      adminDataService.createCompetition({
        ...formData,
        status,
        participantsCount: 0,
      });
      showToast(`Created new competition '${formData.title}' as ${status}.`, 'success');
    }

    setCreateModalOpen(false);
    refreshList();
  };

  const handleStatusChange = (comp: Competition, nextStatus: CompetitionStatus) => {
    const actionWord = nextStatus === 'live' ? 'Start' : nextStatus === 'completed' ? 'End' : 'Cancel';
    setConfirmDialog({
      isOpen: true,
      title: `${actionWord} Competition`,
      description: `Are you sure you want to change '${comp.title}' status to ${nextStatus.toUpperCase()}? This will affect participant dashboard access.`,
      variant: nextStatus === 'cancelled' ? 'danger' : 'warning',
      confirmLabel: actionWord,
      action: () => {
        adminDataService.updateCompetition(comp.id, { status: nextStatus });
        showToast(`Competition status changed to ${nextStatus}.`, 'success');
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        refreshList();
      },
    });
  };

  const handleDeleteDraft = (comp: Competition) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Draft Competition',
      description: `Are you sure you want to permanently delete draft '${comp.title}'? This action cannot be undone.`,
      variant: 'danger',
      confirmLabel: 'Delete Draft',
      action: () => {
        adminDataService.deleteCompetition(comp.id);
        showToast('Draft competition removed.', 'info');
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        refreshList();
      },
    });
  };

  const tabs = [
    { id: 'all', label: 'All', count: competitions.length },
    { id: 'live', label: 'Live', count: competitions.filter((c) => c.status === 'live').length },
    { id: 'scheduled', label: 'Scheduled', count: competitions.filter((c) => c.status === 'scheduled').length },
    { id: 'draft', label: 'Draft', count: competitions.filter((c) => c.status === 'draft').length },
    { id: 'completed', label: 'Completed', count: competitions.filter((c) => c.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: competitions.filter((c) => c.status === 'cancelled').length },
  ];

  return (
    <AdminLayout
      title="Competitions"
      subtitle="Create, schedule and manage hackathon competitions."
      action={
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          icon={<Plus className="h-4 w-4" />}
        >
          Create Competition
        </Button>
      }
    >
      {/* Controls: Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#737D9D]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search competitions..."
            className="w-full bg-[#13162D] border border-[#272B49] focus:border-[#7C3AED] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F8FAFC] placeholder-[#737D9D] focus:outline-none"
          />
        </div>
      </div>

      {/* Competitions Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-6 w-6" />}
          title="No competitions found"
          description="Try adjusting your filter or search query, or create a new tournament."
          actionLabel="Create Competition"
          onAction={handleOpenCreate}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Competition Title</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((comp) => (
              <TableRow key={comp.id}>
                <TableCell>
                  <div>
                    <span className="font-semibold text-[#F8FAFC] block">{comp.title}</span>
                    <span className="text-[11px] text-[#737D9D] truncate max-w-sm block">
                      {comp.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-[#A5ADCA]">
                    {new Date(comp.startDate).toLocaleDateString()} {new Date(comp.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-[#A5ADCA]">
                    {new Date(comp.endDate).toLocaleDateString()} {new Date(comp.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(comp.status)}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#F8FAFC]">
                    <Users className="h-3 w-3 text-[#8B5CF6]" />
                    {comp.participantsCount.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setViewModalCompetition(comp)}
                      title="View Details"
                      className="p-1.5 rounded-lg text-[#A5ADCA] hover:text-[#F8FAFC] hover:bg-[#191B38] transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(comp)}
                      title="Edit"
                      className="p-1.5 rounded-lg text-[#A5ADCA] hover:text-[#F8FAFC] hover:bg-[#191B38] transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => navigate('/admin/participants')}
                      title="Manage Participants"
                      className="p-1.5 rounded-lg text-[#A5ADCA] hover:text-[#8B5CF6] hover:bg-[#191B38] transition-colors"
                    >
                      <Users className="h-3.5 w-3.5" />
                    </button>

                    {comp.status === 'scheduled' && (
                      <button
                        onClick={() => handleStatusChange(comp, 'live')}
                        title="Start Competition"
                        className="p-1.5 rounded-lg text-[#10B981] hover:bg-[#10B981]/15 transition-colors"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {comp.status === 'live' && (
                      <button
                        onClick={() => handleStatusChange(comp, 'completed')}
                        title="End Competition"
                        className="p-1.5 rounded-lg text-[#F59E0B] hover:bg-[#F59E0B]/15 transition-colors"
                      >
                        <Square className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {comp.status !== 'completed' && comp.status !== 'cancelled' && comp.status !== 'draft' && (
                      <button
                        onClick={() => handleStatusChange(comp, 'cancelled')}
                        title="Cancel Competition"
                        className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/15 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {comp.status === 'draft' && (
                      <button
                        onClick={() => handleDeleteDraft(comp)}
                        title="Delete Draft"
                        className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/15 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create / Edit Modal Form */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={editingCompetition ? 'Edit Competition' : 'Create New Competition'}
        subtitle="Configure hackathon tournament timeline, rules, and participant parameters."
        maxWidth="xl"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSaveCompetition('draft')}
            >
              Save as Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSaveCompetition('scheduled')}
            >
              Schedule Competition
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
              Competition Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Code Battle 2026 — Autumn Grand Prix"
              className="w-full bg-[#0D1024] border border-[#272B49] focus:border-[#7C3AED] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] placeholder-[#737D9D] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide an overview of the challenges, rounds, and eligibility criteria..."
              className="w-full bg-[#0D1024] border border-[#272B49] focus:border-[#7C3AED] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] placeholder-[#737D9D] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                Start Date &amp; Time
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-[#0D1024] border border-[#272B49] focus:border-[#7C3AED] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                End Date &amp; Time
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-[#0D1024] border border-[#272B49] focus:border-[#7C3AED] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                Registration Deadline
              </label>
              <input
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                className="w-full bg-[#0D1024] border border-[#272B49] focus:border-[#7C3AED] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                Starting Round
              </label>
              <select
                value={formData.currentRound}
                onChange={(e) => setFormData({ ...formData, currentRound: e.target.value as RoundName })}
                className="w-full bg-[#0D1024] border border-[#272B49] focus:border-[#7C3AED] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
              >
                <option value="Quiz Battle">Round 1: Quiz Battle</option>
                <option value="Coding Battle">Round 2: Coding Battle</option>
                <option value="Debugging Battle">Round 3: Debugging Battle</option>
                <option value="Final Battle">Round 4: Final Battle</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                Max Participant Limit
              </label>
              <input
                type="number"
                value={formData.maxTeams}
                onChange={(e) => setFormData({ ...formData, maxTeams: Number(e.target.value) })}
                className="w-full bg-[#0D1024] border border-[#272B49] focus:border-[#7C3AED] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
              Competition Rules &amp; Integrity Guidelines
            </label>
            <textarea
              rows={3}
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              className="w-full bg-[#0D1024] border border-[#272B49] focus:border-[#7C3AED] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
            />
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      {viewModalCompetition && (
        <Modal
          isOpen={Boolean(viewModalCompetition)}
          onClose={() => setViewModalCompetition(null)}
          title={viewModalCompetition.title}
          subtitle={`Competition ID: ${viewModalCompetition.id}`}
          maxWidth="md"
          footer={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewModalCompetition(null)}
            >
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#272B49]">
              <span className="text-[#A5ADCA]">Status</span>
              {getStatusBadge(viewModalCompetition.status)}
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-[#272B49]">
              <span className="text-[#A5ADCA]">Enrolled Competitors</span>
              <span className="font-mono font-bold text-[#F8FAFC]">
                {viewModalCompetition.participantsCount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-[#272B49]">
              <span className="text-[#A5ADCA]">Current Active Round</span>
              <Badge variant="purple" size="sm">
                {viewModalCompetition.currentRound}
              </Badge>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-[#272B49]">
              <span className="text-[#A5ADCA]">Tournament Duration</span>
              <span className="font-mono text-[#F8FAFC]">{viewModalCompetition.durationHours} hours</span>
            </div>

            <div>
              <span className="text-[#A5ADCA] block mb-1">Description</span>
              <p className="p-2.5 rounded bg-[#0D1024] border border-[#272B49] text-[#F8FAFC]">
                {viewModalCompetition.description}
              </p>
            </div>

            <div>
              <span className="text-[#A5ADCA] block mb-1">Enforced Rules</span>
              <p className="p-2.5 rounded bg-[#0D1024] border border-[#272B49] text-[#A5ADCA] font-mono text-[11px]">
                {viewModalCompetition.rules}
              </p>
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
