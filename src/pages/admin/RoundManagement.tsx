import { useState } from 'react';
import {
  Edit2,
  Clock,
  HelpCircle,
  Code,
  Bug,
  Flame,
  Plus,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/layout/AdminLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/admin/ui/Table';
import { Badge, type BadgeVariant } from '../../components/admin/ui/Badge';
import { Button } from '../../components/admin/ui/Button';
import { Card, CardBody } from '../../components/admin/ui/Card';
import { Modal } from '../../components/admin/ui/Modal';
import { adminDataService } from '../../services/adminDataService';
import { useToast } from '../../context/ToastContext';
import type { Round, RoundType, QualificationRuleType, RoundName } from '../../types/admin';

export default function RoundManagement() {
  const { showToast } = useToast();

  const [rounds, setRounds] = useState<Round[]>(() => adminDataService.getRounds());
  const [editingRound, setEditingRound] = useState<Round | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: 'Quiz Battle' as RoundName,
    type: 'quiz' as RoundType,
    startDate: '',
    endDate: '',
    durationMinutes: 90,
    maxMarks: 100,
    qualificationRule: 'min_score' as QualificationRuleType,
    qualificationThreshold: 65,
    maxQualifiers: 700,
    penaltyPerWrong: 1,
    instructions: '',
    enabled: true,
  });

  const refreshList = () => {
    setRounds(adminDataService.getRounds());
  };

  const handleOpenEdit = (r: Round) => {
    setEditingRound(r);
    setFormData({
      name: r.name,
      type: r.type,
      startDate: r.startDate.slice(0, 16),
      endDate: r.endDate.slice(0, 16),
      durationMinutes: r.durationMinutes,
      maxMarks: r.maxMarks,
      qualificationRule: r.qualificationRule,
      qualificationThreshold: r.qualificationThreshold,
      maxQualifiers: r.maxQualifiers,
      penaltyPerWrong: r.penaltyPerWrong,
      instructions: r.instructions,
      enabled: r.enabled,
    });
  };

  const handleSaveRound = () => {
    if (!editingRound) return;

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      showToast('End date must be after Start date.', 'error');
      return;
    }
    if (formData.maxMarks <= 0) {
      showToast('Maximum marks must be greater than zero.', 'error');
      return;
    }

    adminDataService.updateRound(editingRound.id, {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    });

    showToast(`Updated round '${editingRound.name}' successfully.`, 'success');
    setEditingRound(null);
    refreshList();
  };

  const getRoundIcon = (type: RoundType) => {
    switch (type) {
      case 'quiz':
        return <HelpCircle className="h-4 w-4 text-[#8B5CF6]" />;
      case 'coding':
        return <Code className="h-4 w-4 text-[#3B82F6]" />;
      case 'debugging':
        return <Bug className="h-4 w-4 text-[#F59E0B]" />;
      case 'final':
        return <Flame className="h-4 w-4 text-[#EF4444]" />;
    }
  };

  const getStatusBadge = (status: Round['status']) => {
    const config: Record<Round['status'], { variant: BadgeVariant; label: string; dot?: boolean }> = {
      completed: { variant: 'purple', label: 'Completed' },
      in_progress: { variant: 'success', label: 'In Progress', dot: true },
      scheduled: { variant: 'bright', label: 'Scheduled' },
      draft: { variant: 'neutral', label: 'Draft' },
    };
    const s = config[status];
    return <Badge variant={s.variant} size="sm" dot={s.dot}>{s.label}</Badge>;
  };

  return (
    <AdminLayout
      title="Round Management"
      subtitle="Configure competition phases, qualification criteria, duration, and penalty schedules."
      action={
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            showToast('All 4 tournament stages are already provisioned. You can edit any existing stage.', 'info');
          }}
          icon={<Plus className="h-4 w-4" />}
        >
          Create Round
        </Button>
      }
    >
      {/* Visual Tournament Pipeline Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {rounds.map((r, idx) => (
          <Card
            key={r.id}
            hoverable
            onClick={() => handleOpenEdit(r)}
            className={`border-t-2 ${
              r.status === 'in_progress'
                ? 'border-t-[#10B981] ring-1 ring-[#10B981]/30'
                : r.status === 'completed'
                ? 'border-t-[#8B5CF6]'
                : 'border-t-[#272B49]'
            }`}
          >
            <CardBody className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#191B38] border border-[#272B49] flex items-center justify-center">
                    {getRoundIcon(r.type)}
                  </div>
                  <span className="text-[11px] font-mono text-[#737D9D]">STAGE 0{idx + 1}</span>
                </div>
                {getStatusBadge(r.status)}
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#F8FAFC]">{r.name}</h4>
                <p className="text-[11px] text-[#A5ADCA] mt-0.5 line-clamp-2">
                  {r.instructions}
                </p>
              </div>

              <div className="pt-2 border-t border-[#272B49]/60 flex items-center justify-between text-xs text-[#737D9D]">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-[#A5ADCA]" />
                  {r.durationMinutes} mins
                </span>
                <span className="font-mono font-semibold text-[#10B981]">
                  {r.maxMarks} max pts
                </span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Rounds Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Round Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Timeline</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Max Marks</TableHead>
            <TableHead>Qualification Rule</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rounds.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-[#0D1024] border border-[#272B49] flex items-center justify-center shrink-0">
                    {getRoundIcon(r.type)}
                  </div>
                  <div>
                    <span className="font-semibold text-[#F8FAFC] block">{r.name}</span>
                    <span className="text-[11px] text-[#737D9D]">{r.questionsCount} challenges in bank</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="uppercase text-[11px] font-mono text-[#A5ADCA] font-medium">
                  {r.type}
                </span>
              </TableCell>
              <TableCell>
                <div className="text-xs text-[#A5ADCA]">
                  <div>Start: {new Date(r.startDate).toLocaleDateString()} {new Date(r.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="text-[11px] text-[#737D9D]">End: {new Date(r.endDate).toLocaleDateString()} {new Date(r.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs text-[#F8FAFC]">{r.durationMinutes} min</span>
              </TableCell>
              <TableCell>
                <span className="font-mono font-semibold text-xs text-[#10B981]">{r.maxMarks}</span>
              </TableCell>
              <TableCell>
                <Badge variant="neutral" size="sm">
                  {r.qualificationRule === 'min_score'
                    ? `Min ${r.qualificationThreshold} pts`
                    : r.qualificationRule === 'top_percent'
                    ? `Top ${r.qualificationThreshold}%`
                    : `Top ${r.qualificationThreshold} qualifiers`}
                </Badge>
              </TableCell>
              <TableCell>{getStatusBadge(r.status)}</TableCell>
              <TableCell align="right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(r)}
                  icon={<Edit2 className="h-3 w-3" />}
                >
                  Configure
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Round Editor Modal */}
      {editingRound && (
        <Modal
          isOpen={Boolean(editingRound)}
          onClose={() => setEditingRound(null)}
          title={`Configure ${editingRound.name}`}
          subtitle="Define schedule, duration, scoring ceiling, and qualification thresholds."
          maxWidth="xl"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setEditingRound(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveRound}>
                Save Changes
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                  Round Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value as RoundName })}
                  className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                  Round Type
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.type.toUpperCase()}
                  className="w-full bg-[#191B38]/60 border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#737D9D] font-mono cursor-not-allowed"
                />
              </div>
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
                  className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
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
                  className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                  className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                  Maximum Round Marks
                </label>
                <input
                  type="number"
                  value={formData.maxMarks}
                  onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                  className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                  Wrong Submission Penalty (Marks)
                </label>
                <input
                  type="number"
                  value={formData.penaltyPerWrong}
                  onChange={(e) => setFormData({ ...formData, penaltyPerWrong: Number(e.target.value) })}
                  className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-[#272B49] bg-[#0D1024]/60 space-y-3">
              <span className="text-xs font-semibold text-[#8B5CF6] block">
                Qualification Engine Criteria
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-[#A5ADCA] mb-1">
                    Qualification Model
                  </label>
                  <select
                    value={formData.qualificationRule}
                    onChange={(e) =>
                      setFormData({ ...formData, qualificationRule: e.target.value as QualificationRuleType })
                    }
                    className="w-full bg-[#13162D] border border-[#272B49] rounded-lg px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:outline-none"
                  >
                    <option value="min_score">Minimum Absolute Score</option>
                    <option value="top_percent">Top Percentage (%)</option>
                    <option value="top_n">Top N Competitors</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#A5ADCA] mb-1">
                    Threshold Value
                  </label>
                  <input
                    type="number"
                    value={formData.qualificationThreshold}
                    onChange={(e) =>
                      setFormData({ ...formData, qualificationThreshold: Number(e.target.value) })
                    }
                    className="w-full bg-[#13162D] border border-[#272B49] rounded-lg px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#A5ADCA] mb-1">
                    Max Qualifier Cap
                  </label>
                  <input
                    type="number"
                    value={formData.maxQualifiers}
                    onChange={(e) =>
                      setFormData({ ...formData, maxQualifiers: Number(e.target.value) })
                    }
                    className="w-full bg-[#13162D] border border-[#272B49] rounded-lg px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                Instructions &amp; Problem Overview
              </label>
              <textarea
                rows={3}
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
              />
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
