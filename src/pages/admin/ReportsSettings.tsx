import { useState } from 'react';
import {
  Download,
  Settings,
  FileSpreadsheet,
  Shield,
  Save,
  Users,
  Trophy,
  Layers,
  Award,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/layout/AdminLayout';
import { Card, CardHeader, CardBody } from '../../components/admin/ui/Card';
import { Badge } from '../../components/admin/ui/Badge';
import { Button } from '../../components/admin/ui/Button';
import { Tabs } from '../../components/admin/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/admin/ui/Table';
import { adminDataService } from '../../services/adminDataService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';

export default function ReportsSettings() {
  const { showToast } = useToast();
  const { user, profile } = useAuth();

  const [mainTab, setMainTab] = useState<'reports' | 'settings'>('reports');

  // Reports state
  const [downloading, setDownloading] = useState<string | null>(null);

  // Settings State
  const [adminName, setAdminName] = useState(profile?.displayName || 'Alex Chen');
  const [adminEmail, setAdminEmail] = useState(user?.email || 'alex.chen@codebattle.dev');
  const [timeoutLimit, setTimeoutLimit] = useState(2000);
  const [rateLimit, setRateLimit] = useState(5);
  const [autoQualify, setAutoQualify] = useState(true);

  const auditLogs = adminDataService.getAuditLogs();

  const handleDownloadReport = (type: 'participants' | 'competitions' | 'leaderboard' | 'submissions', filename: string) => {
    setDownloading(type);
    setTimeout(() => {
      const csvData = adminDataService.generateCSV(type);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloading(null);
      showToast(`Exported ${filename}.csv successfully.`, 'success');
    }, 600);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    adminDataService.addAuditLog('Updated System Configuration', 'security', `Admin updated execution parameters (Timeout: ${timeoutLimit}ms, RateLimit: ${rateLimit}/min)`);
    showToast('System configuration & profile preferences updated.', 'success');
  };

  const pageTabs = [
    { id: 'reports', label: 'Reports & Exports', icon: <FileSpreadsheet className="h-4 w-4" /> },
    { id: 'settings', label: 'Settings & Security', icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <AdminLayout
      title="Reports & Settings"
      subtitle="Export authoritative event archives, inspect security audit trails, and manage governance preferences."
    >
      {/* Primary Section Switcher */}
      <Tabs
        tabs={pageTabs}
        activeTab={mainTab}
        onChange={(id) => setMainTab(id as any)}
        className="mb-6"
      />

      {/* TAB 1: Reports & Exports */}
      {mainTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Report 1: Participant Report */}
            <Card hoverable className="border-l-4 border-l-[#7C3AED]">
              <CardBody className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#6D28D9]/20 text-[#8B5CF6] border border-[#6D28D9]/40 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F8FAFC]">Participant Demographic &amp; Status Report</h3>
                      <p className="text-xs text-[#A5ADCA] mt-0.5">
                        Complete directory of registered participants, institution details, account states, and current round qualification.
                      </p>
                    </div>
                  </div>
                  <Badge variant="purple" size="sm">
                    CSV Ready
                  </Badge>
                </div>

                <div className="pt-3 border-t border-[#272B49] flex items-center justify-between text-xs">
                  <span className="text-[#737D9D]">1,420 rows • Real-time database sync</span>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={downloading === 'participants'}
                    onClick={() => handleDownloadReport('participants', 'codebattle_participants_report')}
                    icon={<Download className="h-3.5 w-3.5" />}
                  >
                    Download CSV
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Report 2: Competition Summary */}
            <Card hoverable className="border-l-4 border-l-[#10B981]">
              <CardBody className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center justify-center shrink-0">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F8FAFC]">Competition Performance Summary</h3>
                      <p className="text-xs text-[#A5ADCA] mt-0.5">
                        High-level metrics across all tournaments: enrollment rates, completion percentages, and schedule compliance.
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    Verified
                  </Badge>
                </div>

                <div className="pt-3 border-t border-[#272B49] flex items-center justify-between text-xs">
                  <span className="text-[#737D9D]">All events • Cumulative summary</span>
                  <Button
                    variant="outline"
                    size="sm"
                    loading={downloading === 'competitions'}
                    onClick={() => handleDownloadReport('competitions', 'codebattle_competitions_summary')}
                    icon={<Download className="h-3.5 w-3.5" />}
                  >
                    Download CSV
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Report 3: Round-wise Report */}
            <Card hoverable className="border-l-4 border-l-[#3B82F6]">
              <CardBody className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 flex items-center justify-center shrink-0">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F8FAFC]">Round-wise Submissions &amp; Evaluation Log</h3>
                      <p className="text-xs text-[#A5ADCA] mt-0.5">
                        Detailed log of every code submission, verdicts (Accepted, TLE, WA), and execution latencies in milliseconds.
                      </p>
                    </div>
                  </div>
                  <Badge variant="info" size="sm">
                    Detailed
                  </Badge>
                </div>

                <div className="pt-3 border-t border-[#272B49] flex items-center justify-between text-xs">
                  <span className="text-[#737D9D]">8,900+ assertions • Sandbox audit</span>
                  <Button
                    variant="outline"
                    size="sm"
                    loading={downloading === 'submissions'}
                    onClick={() => handleDownloadReport('submissions', 'codebattle_submissions_log')}
                    icon={<Download className="h-3.5 w-3.5" />}
                  >
                    Download CSV
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Report 4: Final Leaderboard */}
            <Card hoverable className="border-l-4 border-l-[#F59E0B]">
              <CardBody className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 flex items-center justify-center shrink-0">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F8FAFC]">Final Leaderboard &amp; Award Export</h3>
                      <p className="text-xs text-[#A5ADCA] mt-0.5">
                        Official final rankings, tie-breaker resolutions, round points, and verified finalist certificates dataset.
                      </p>
                    </div>
                  </div>
                  <Badge variant="warning" size="sm">
                    Authoritative
                  </Badge>
                </div>

                <div className="pt-3 border-t border-[#272B49] flex items-center justify-between text-xs">
                  <span className="text-[#737D9D]">Audited rankings • Exportable</span>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={downloading === 'leaderboard'}
                    onClick={() => handleDownloadReport('leaderboard', 'codebattle_official_leaderboard')}
                    icon={<Download className="h-3.5 w-3.5" />}
                  >
                    Download CSV
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: Settings & Security */}
      {mainTab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 cols: Profile & System Parameters */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <Card>
                <CardHeader
                  title="Administrator Profile"
                  subtitle="Manage your credentials and chief judge identity"
                />
                <CardBody className="p-5">
                  <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                    <div className="flex items-center gap-4 pb-4 border-b border-[#272B49]">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] flex items-center justify-center font-bold text-lg text-[#F8FAFC] shadow-lg shadow-[#6D28D9]/40 border-2 border-[#8B5CF6]/40">
                        {adminName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#F8FAFC]">{adminName}</h4>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#10B981] font-semibold mt-0.5">
                          <Shield className="h-3 w-3" /> Chief Platform Administrator
                        </span>
                        <p className="text-[11px] text-[#737D9D] mt-0.5">
                          Role: Superadmin • Full write access to scoring &amp; rounds
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                          Administrative Email
                        </label>
                        <input
                          type="email"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        icon={<Save className="h-3.5 w-3.5" />}
                      >
                        Update Profile
                      </Button>
                    </div>
                  </form>
                </CardBody>
              </Card>

              {/* System Execution Parameters */}
              <Card>
                <CardHeader
                  title="Competition Sandbox Parameters"
                  subtitle="Govern runner sandbox resources and submission throttling"
                />
                <CardBody className="p-5 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                        Global Execution Timeout (ms)
                      </label>
                      <input
                        type="number"
                        value={timeoutLimit}
                        onChange={(e) => setTimeoutLimit(Number(e.target.value))}
                        className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
                      />
                      <span className="text-[10px] text-[#737D9D] mt-1 block">
                        Watchdog killer threshold per unit test execution.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                        Submission Rate Limit (per minute)
                      </label>
                      <input
                        type="number"
                        value={rateLimit}
                        onChange={(e) => setRateLimit(Number(e.target.value))}
                        className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
                      />
                      <span className="text-[10px] text-[#737D9D] mt-1 block">
                        Maximum submissions per participant per minute to prevent flooding.
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#272B49] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#F8FAFC] block">
                        Automated Qualification Advancement
                      </span>
                      <p className="text-[11px] text-[#A5ADCA]">
                        Automatically promote candidates who cross threshold when round ends.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoQualify}
                        onChange={(e) => setAutoQualify(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#272B49] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7C3AED]"></div>
                    </label>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Right 1 col: Role Based Access Control */}
            <div className="space-y-6">
              <Card>
                <CardHeader
                  title="Role-Based Access Control"
                  subtitle="Authorized security tiers"
                />
                <CardBody className="p-4 space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#0D1024] border border-[#272B49] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#F8FAFC]">Chief Admin (Super)</span>
                      <Badge variant="bright" size="sm">Active (You)</Badge>
                    </div>
                    <p className="text-[11px] text-[#737D9D]">
                      Full permissions: question bank, live score recalculation, and publishing.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0D1024] border border-[#272B49] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#F8FAFC]">Competition Manager</span>
                      <Badge variant="neutral" size="sm">2 Members</Badge>
                    </div>
                    <p className="text-[11px] text-[#737D9D]">
                      Can schedule tournaments, edit rounds, and view submission logs.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0D1024] border border-[#272B49] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#F8FAFC]">External Judge</span>
                      <Badge variant="neutral" size="sm">4 Members</Badge>
                    </div>
                    <p className="text-[11px] text-[#737D9D]">
                      Read-only access to submissions and subjective final battle code reviews.
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader
              title="Administrative Security &amp; Audit Logs"
              subtitle="Tamper-evident trail of all configuration changes and score adjustments"
            />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Administrator</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Action Triggered</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <span className="text-xs font-mono text-[#A5ADCA]">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-[#F8FAFC] block">{log.adminName}</span>
                      <span className="text-[10px] text-[#737D9D] font-mono">{log.adminEmail}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="purple" size="sm">
                        {log.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-[#F8FAFC]">{log.action}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[#A5ADCA] max-w-sm line-clamp-1">
                        {log.details}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
