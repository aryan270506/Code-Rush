import { useNavigate } from 'react-router-dom';
import {
  Users,
  Trophy,
  FileCheck2,
  CheckCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  ExternalLink,
  Zap,
  Activity,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AdminLayout } from '../../components/admin/layout/AdminLayout';
import { Card, CardHeader, CardBody } from '../../components/admin/ui/Card';
import { Badge } from '../../components/admin/ui/Badge';
import { Button } from '../../components/admin/ui/Button';
import { adminDataService } from '../../services/adminDataService';

export default function AdminOverview() {
  const navigate = useNavigate();

  const metrics = adminDataService.getOverviewMetrics();
  const trendsData = adminDataService.getRegistrationTrends();
  const participationData = adminDataService.getRoundParticipation();
  const competitions = adminDataService.getCompetitions();
  const liveCompetition = competitions.find((c) => c.status === 'live') || competitions[0];
  const upcoming = competitions.filter((c) => c.status === 'scheduled');
  const participants = adminDataService.getParticipants().slice(0, 5);
  const submissions = adminDataService.getSubmissions().slice(0, 4);
  const activities = adminDataService.getAuditLogs().slice(0, 4);

  return (
    <AdminLayout
      title="Admin Overview"
      subtitle="Comprehensive command center and real-time event analytics for Code Battle."
      action={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/leaderboard')}
            icon={<Award className="h-3.5 w-3.5 text-[#8B5CF6]" />}
          >
            Live Standings
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/competitions')}
            icon={<Zap className="h-3.5 w-3.5" />}
          >
            Manage Events
          </Button>
        </div>
      }
    >
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Total Participants */}
        <Card className="border-l-4 border-l-[#7C3AED]">
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-[#A5ADCA]">
              <span className="text-xs font-medium">Total Participants</span>
              <div className="h-8 w-8 rounded-lg bg-[#6D28D9]/15 flex items-center justify-center text-[#8B5CF6] border border-[#6D28D9]/30">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
                {metrics.totalParticipants.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#10B981]">
                <TrendingUp className="h-3 w-3" />
                {metrics.participantsTrend.split(' ')[0]}
              </span>
            </div>
            <p className="text-[11px] text-[#737D9D] mt-1">Confirmed student &amp; developer entries</p>
          </CardBody>
        </Card>

        {/* Card 2: Active Competitions */}
        <Card className="border-l-4 border-l-[#10B981]">
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-[#A5ADCA]">
              <span className="text-xs font-medium">Active Competitions</span>
              <div className="h-8 w-8 rounded-lg bg-[#10B981]/15 flex items-center justify-center text-[#10B981] border border-[#10B981]/30">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
                {metrics.activeCompetitions}
              </span>
              <Badge variant="success" size="sm" dot>
                Live Now
              </Badge>
            </div>
            <p className="text-[11px] text-[#737D9D] mt-1">{metrics.competitionsTrend}</p>
          </CardBody>
        </Card>

        {/* Card 3: Total Submissions */}
        <Card className="border-l-4 border-l-[#3B82F6]">
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-[#A5ADCA]">
              <span className="text-xs font-medium">Total Submissions</span>
              <div className="h-8 w-8 rounded-lg bg-[#3B82F6]/15 flex items-center justify-center text-[#3B82F6] border border-[#3B82F6]/30">
                <FileCheck2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
                {metrics.totalSubmissions.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#10B981]">
                <TrendingUp className="h-3 w-3" />
                {metrics.submissionsTrend.split(' ')[0]}
              </span>
            </div>
            <p className="text-[11px] text-[#737D9D] mt-1">Evaluated across all test harnesses</p>
          </CardBody>
        </Card>

        {/* Card 4: Qualified Participants */}
        <Card className="border-l-4 border-l-[#8B5CF6]">
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-[#A5ADCA]">
              <span className="text-xs font-medium">Qualified Competitors</span>
              <div className="h-8 w-8 rounded-lg bg-[#7C3AED]/20 flex items-center justify-center text-[#8B5CF6] border border-[#7C3AED]/40">
                <CheckCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
                {metrics.qualifiedParticipants}
              </span>
              <span className="text-[11px] font-mono text-[#8B5CF6]">
                {metrics.qualifiedRate.split(' ')[0]}
              </span>
            </div>
            <p className="text-[11px] text-[#737D9D] mt-1">Cleared Round 1 cut-off criteria</p>
          </CardBody>
        </Card>
      </div>

      {/* 2. Live Competition Banner */}
      {liveCompetition && (
        <Card className="mb-6 bg-gradient-to-r from-[#13162D] via-[#191B38] to-[#13162D] border border-[#7C3AED]/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent" />
          <CardBody className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
                <Badge variant="bright" size="sm">
                  CURRENT LIVE TOURNAMENT
                </Badge>
                <span className="text-xs text-[#737D9D]">• Round 2 of 4</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC]">
                {liveCompetition.title}
              </h2>
              <p className="text-xs text-[#A5ADCA] max-w-xl">
                Current Phase: <strong className="text-[#8B5CF6]">{liveCompetition.currentRound}</strong> — 3 Algorithmic challenges with automated execution workers active.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              <div className="bg-[#0D1024] border border-[#272B49] px-3.5 py-2 rounded-lg flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-[#F59E0B]" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#737D9D] uppercase tracking-wider font-semibold">Remaining in Round</span>
                  <span className="text-xs font-mono font-bold text-[#F8FAFC]">02h : 48m : 15s</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/admin/rounds')}
                icon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                View Round Controls
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* 3. Analytics Section: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Registration & Submission Trends Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Registration & Submission Trends"
            subtitle="Cumulative participant registrations vs live automated submissions"
            action={
              <Badge variant="purple" size="sm">
                Last 18 Days
              </Badge>
            }
          />
          <CardBody className="p-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#737D9D"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#272B49' }}
                  />
                  <YAxis
                    stroke="#737D9D"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#272B49' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#13162D',
                      borderColor: '#272B49',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="registrations"
                    name="Registrations"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#purpleGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="submissions"
                    name="Submissions"
                    stroke="#3B82F6"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#blueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2 pt-2 border-t border-[#272B49] text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#7C3AED]" />
                <span className="text-[#A5ADCA]">Participants (1,420 max)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
                <span className="text-[#A5ADCA]">Code Submissions (8,945 total)</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Round-wise Participation Donut Chart */}
        <Card>
          <CardHeader
            title="Round-wise Participation"
            subtitle="Qualification funnel through the 4 rounds"
          />
          <CardBody className="p-4 flex flex-col items-center justify-center">
            <div className="h-52 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={participationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {participationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#13162D" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#13162D',
                      borderColor: '#272B49',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-[#F8FAFC]">4</span>
                <span className="text-[10px] text-[#737D9D] uppercase tracking-wider">Rounds</span>
              </div>
            </div>

            <div className="w-full space-y-1.5 mt-2">
              {participationData.map((r) => (
                <div key={r.name} className="flex items-center justify-between text-xs py-1 border-b border-[#272B49]/40 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="text-[#A5ADCA]">{r.name}</span>
                  </div>
                  <span className="font-mono text-[#F8FAFC] font-semibold">{r.value}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 4. Multi-Section Grid: Top Performers & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top Performers Preview */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Current Leaderboard Leaders"
            subtitle="Top 5 contenders based on cumulative scores"
            action={
              <button
                onClick={() => navigate('/admin/leaderboard')}
                className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] flex items-center gap-1 font-medium transition-colors"
              >
                <span>Full Leaderboard</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            }
          />
          <div className="divide-y divide-[#272B49]/70">
            {participants.map((p, idx) => (
              <div
                key={p.id}
                className="px-5 py-3.5 flex items-center justify-between hover:bg-[#191B38]/50 transition-colors cursor-pointer"
                onClick={() => navigate('/admin/participants')}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0
                        ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                        : idx === 1
                        ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                        : idx === 2
                        ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                        : 'bg-[#191B38] text-[#737D9D]'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#F8FAFC]">{p.name}</span>
                      <Badge variant="purple" size="sm">
                        {p.currentRound}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-[#737D9D]">{p.email}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#10B981]">
                    {p.totalScore} pts
                  </span>
                  <div className="text-[10px] text-[#A5ADCA]">
                    Q: {p.roundScores.quiz} | C: {p.roundScores.coding}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Admin Activity Feed */}
        <Card>
          <CardHeader
            title="Administrative Activity"
            subtitle="Security audits &amp; event triggers"
          />
          <div className="p-4 space-y-3.5">
            {activities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="h-6 w-6 rounded-full bg-[#191B38] border border-[#272B49] flex items-center justify-center shrink-0 mt-0.5 text-[#8B5CF6]">
                  <Activity className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#F8FAFC]">{act.action}</span>
                    <span className="text-[10px] text-[#737D9D]">
                      {act.timestamp.split('T')[1].substring(0, 5)}Z
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A5ADCA] leading-tight">{act.details}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 5. Bottom Row: Upcoming Competitions & Recent Submissions Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Competitions */}
        <Card>
          <CardHeader
            title="Upcoming Competitions"
            subtitle="Scheduled tournaments awaiting launch"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/competitions')}
              >
                View All ({competitions.length})
              </Button>
            }
          />
          <CardBody className="p-4 space-y-3">
            {upcoming.length === 0 ? (
              <p className="text-xs text-[#737D9D]">No scheduled competitions at this time.</p>
            ) : (
              upcoming.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-lg border border-[#272B49] bg-[#0D1024]/60 flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs font-semibold text-[#F8FAFC]">{c.title}</h4>
                    <p className="text-[11px] text-[#737D9D] mt-0.5">
                      Starts {new Date(c.startDate).toLocaleDateString()} • {c.participantsCount} enrolled
                    </p>
                  </div>
                  <Badge variant="info" size="sm">
                    Scheduled
                  </Badge>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader
            title="Live Submissions Stream"
            subtitle="Real-time participant code submissions"
            action={
              <button
                onClick={() => navigate('/admin/submissions')}
                className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] flex items-center gap-1 font-medium"
              >
                <span>All Submissions</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            }
          />
          <CardBody className="p-0">
            <div className="divide-y divide-[#272B49]/70">
              {submissions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => navigate('/admin/submissions')}
                  className="px-4 py-3 flex items-center justify-between hover:bg-[#191B38]/50 transition-colors cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#F8FAFC]">{s.participantName}</span>
                      <span className="text-[10px] text-[#737D9D] font-mono">({s.language})</span>
                    </div>
                    <p className="text-[11px] text-[#A5ADCA] truncate max-w-xs">{s.questionTitle}</p>
                  </div>

                  <div className="text-right">
                    <Badge
                      variant={
                        s.status === 'accepted'
                          ? 'success'
                          : s.status === 'evaluating'
                          ? 'info'
                          : 'error'
                      }
                      size="sm"
                    >
                      {s.status === 'accepted' ? `Accepted (+${s.score})` : s.status}
                    </Badge>
                    <span className="block text-[10px] text-[#737D9D] mt-0.5">
                      {s.submittedAt.split('T')[1].substring(0, 8)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  );
}
