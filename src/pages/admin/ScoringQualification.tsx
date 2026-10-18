import { useState } from 'react';
import {
  Save,
  RefreshCw,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/layout/AdminLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/admin/ui/Table';
import { Badge } from '../../components/admin/ui/Badge';
import { Button } from '../../components/admin/ui/Button';
import { Card, CardHeader, CardBody } from '../../components/admin/ui/Card';
import { Tabs } from '../../components/admin/ui/Tabs';
import { adminDataService } from '../../services/adminDataService';
import { useToast } from '../../context/ToastContext';
import type { RoundName, ScoringRule, QualificationCriteria } from '../../types/admin';

export default function ScoringQualification() {
  const { showToast } = useToast();

  const [mainTab, setMainTab] = useState<'scoring' | 'qualification' | 'tiebreakers'>('scoring');
  const [selectedRound, setSelectedRound] = useState<RoundName>('Coding Battle');

  const [scoringRules, setScoringRules] = useState<Record<RoundName, ScoringRule>>(() =>
    adminDataService.getScoringRules()
  );
  const [qualRules, setQualRules] = useState<Record<RoundName, QualificationCriteria>>(() =>
    adminDataService.getQualificationRules()
  );

  const participants = adminDataService.getParticipants();
  const sortedParticipants = [...participants].sort((a, b) => b.totalScore - a.totalScore);

  const handleSaveScoringRule = () => {
    adminDataService.updateScoringRule(selectedRound, scoringRules[selectedRound]);
    showToast(`Updated scoring rules for ${selectedRound}.`, 'success');
  };

  const handleSaveQualRule = () => {
    adminDataService.updateQualificationRule(selectedRound, qualRules[selectedRound]);
    showToast(`Updated qualification criteria for ${selectedRound}.`, 'success');
  };

  const currentScoring = scoringRules[selectedRound];
  const currentQual = qualRules[selectedRound];

  const pageTabs = [
    { id: 'scoring', label: 'Scoring Rules' },
    { id: 'qualification', label: 'Qualification Rules' },
    { id: 'tiebreakers', label: 'Tie-breakers' },
  ];

  return (
    <AdminLayout
      title="Scoring & Qualification"
      subtitle="Configure scoring point allocation, automated qualification cut-offs, and tie-breaker priority."
    >
      {/* Navigation Tabs */}
      <Tabs
        tabs={pageTabs}
        activeTab={mainTab}
        onChange={(id) => setMainTab(id as any)}
        className="mb-6"
      />

      {/* Round Selector Bar */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        <span className="text-xs text-[#737D9D] font-medium mr-2">Configuring Round:</span>
        {(['Quiz Battle', 'Coding Battle', 'Debugging Battle', 'Final Battle'] as RoundName[]).map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRound(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedRound === r
                ? 'bg-[#6D28D9] text-[#F8FAFC] shadow-sm shadow-[#6D28D9]/40 border border-[#8B5CF6]/40'
                : 'bg-[#13162D] text-[#A5ADCA] border border-[#272B49] hover:text-[#F8FAFC]'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* TAB 1: Scoring Rules */}
      {mainTab === 'scoring' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader
              title={`Scoring Parameters — ${selectedRound}`}
              subtitle="Calibrate points awarded, penalties, and partial credit models"
            />
            <CardBody className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                    Base Marks per Challenge
                  </label>
                  <input
                    type="number"
                    value={currentScoring.marksPerQuestion}
                    onChange={(e) => {
                      const updated = { ...currentScoring, marksPerQuestion: Number(e.target.value) };
                      setScoringRules({ ...scoringRules, [selectedRound]: updated });
                    }}
                    className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#737D9D] mt-1 block">
                    Points awarded upon passing 100% of test cases.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                    Incorrect Submission Penalty (Points)
                  </label>
                  <input
                    type="number"
                    value={currentScoring.incorrectPenalty}
                    onChange={(e) => {
                      const updated = { ...currentScoring, incorrectPenalty: Number(e.target.value) };
                      setScoringRules({ ...scoringRules, [selectedRound]: updated });
                    }}
                    className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#737D9D] mt-1 block">
                    Penalty deducted for failed submissions prior to accept.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#272B49]">
                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                    Round Maximum Marks Cap
                  </label>
                  <input
                    type="number"
                    value={currentScoring.maxMarks}
                    onChange={(e) => {
                      const updated = { ...currentScoring, maxMarks: Number(e.target.value) };
                      setScoringRules({ ...scoringRules, [selectedRound]: updated });
                    }}
                    className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <span className="text-xs font-semibold text-[#F8FAFC] mb-2">
                    Partial Scoring Mechanism
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentScoring.partialScoring}
                      onChange={(e) => {
                        const updated = { ...currentScoring, partialScoring: e.target.checked };
                        setScoringRules({ ...scoringRules, [selectedRound]: updated });
                      }}
                      className="rounded border-[#272B49] text-[#6D28D9] focus:ring-[#7C3AED] h-4 w-4 bg-[#0D1024]"
                    />
                    <span className="text-xs text-[#A5ADCA]">
                      Award proportional points for passing partial test suites
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveScoringRule}
                  icon={<Save className="h-3.5 w-3.5" />}
                >
                  Save Scoring Rules
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Scoring Rule Summary"
              subtitle="Active logic applied during automated grading"
            />
            <CardBody className="p-4 space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#0D1024] border border-[#272B49] space-y-1">
                <span className="text-[10px] text-[#737D9D] uppercase block">Grade Formula</span>
                <p className="font-mono text-[#F8FAFC] text-[11px]">
                  Points = (Passed_Weight / Total_Weight) * Base - (Fails * Penalty)
                </p>
              </div>
              <p className="text-[#A5ADCA] text-[11px] leading-relaxed">
                Submissions in {selectedRound} receive immediate sandbox execution. Penalties only apply if candidate eventually achieves an accepted verdict.
              </p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 2: Qualification Rules */}
      {mainTab === 'qualification' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader
              title={`Qualification Criteria — ${selectedRound}`}
              subtitle="Define cut-off criteria determining which competitors advance"
            />
            <CardBody className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                  Qualification Model
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => {
                      const updated = { ...currentQual, type: 'min_score' as const };
                      setQualRules({ ...qualRules, [selectedRound]: updated });
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      currentQual.type === 'min_score'
                        ? 'border-[#7C3AED] bg-[#6D28D9]/20 text-[#F8FAFC]'
                        : 'border-[#272B49] bg-[#0D1024] text-[#A5ADCA]'
                    }`}
                  >
                    <span className="font-semibold block">Minimum Score</span>
                    <span className="text-[10px] text-[#737D9D]">Fixed points threshold</span>
                  </div>

                  <div
                    onClick={() => {
                      const updated = { ...currentQual, type: 'top_percent' as const };
                      setQualRules({ ...qualRules, [selectedRound]: updated });
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      currentQual.type === 'top_percent'
                        ? 'border-[#7C3AED] bg-[#6D28D9]/20 text-[#F8FAFC]'
                        : 'border-[#272B49] bg-[#0D1024] text-[#A5ADCA]'
                    }`}
                  >
                    <span className="font-semibold block">Top Percentage (%)</span>
                    <span className="text-[10px] text-[#737D9D]">Top percentile advance</span>
                  </div>

                  <div
                    onClick={() => {
                      const updated = { ...currentQual, type: 'top_n' as const };
                      setQualRules({ ...qualRules, [selectedRound]: updated });
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      currentQual.type === 'top_n'
                        ? 'border-[#7C3AED] bg-[#6D28D9]/20 text-[#F8FAFC]'
                        : 'border-[#272B49] bg-[#0D1024] text-[#A5ADCA]'
                    }`}
                  >
                    <span className="font-semibold block">Top N Contenders</span>
                    <span className="text-[10px] text-[#737D9D]">Fixed leaderboard rank</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                    Threshold Value
                  </label>
                  <input
                    type="number"
                    value={currentQual.threshold}
                    onChange={(e) => {
                      const updated = { ...currentQual, threshold: Number(e.target.value) };
                      setQualRules({ ...qualRules, [selectedRound]: updated });
                    }}
                    className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#737D9D] mt-1 block">
                    {currentQual.type === 'min_score'
                      ? 'Candidates with points >= threshold qualify'
                      : currentQual.type === 'top_percent'
                      ? `Top ${currentQual.threshold}% of scorers advance`
                      : `Top ${currentQual.threshold} ranked contenders advance`}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                    Maximum Qualifier Ceiling
                  </label>
                  <input
                    type="number"
                    value={currentQual.maxQualifiers}
                    onChange={(e) => {
                      const updated = { ...currentQual, maxQualifiers: Number(e.target.value) };
                      setQualRules({ ...qualRules, [selectedRound]: updated });
                    }}
                    className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#737D9D] mt-1 block">
                    Hard cap on total participants advanced to next round.
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveQualRule}
                  icon={<Save className="h-3.5 w-3.5" />}
                >
                  Save Qualification Criteria
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Qualification Impact"
              subtitle="Projected qualifiers advancing to next round"
            />
            <CardBody className="p-4 space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#0D1024] border border-[#272B49]">
                <span className="text-[10px] text-[#737D9D] uppercase block">Advancing Slots</span>
                <span className="text-xl font-bold font-mono text-[#10B981]">
                  {currentQual.maxQualifiers} Max Qualifiers
                </span>
              </div>
              <p className="text-[#A5ADCA] text-[11px] leading-relaxed">
                Audit logs record all recalculations. Conflicting or impossible constraints (such as minimum score exceeding round max marks) are automatically blocked.
              </p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 3: Tie-breakers */}
      {mainTab === 'tiebreakers' && (
        <Card className="mb-8">
          <CardHeader
            title="Tie-breaker Priority Hierarchy"
            subtitle="Authoritative resolution order when participants have identical total points"
          />
          <CardBody className="p-5 space-y-3 text-xs">
            <div className="space-y-2 max-w-xl">
              {[
                { rank: 1, title: 'Total Cumulative Score', desc: 'Highest overall points across all completed rounds.' },
                { rank: 2, title: 'Fastest Solve Timestamp', desc: 'Earliest submission timestamp on the highest weighted challenge.' },
                { rank: 3, title: 'Fewest Incorrect Submissions', desc: 'Lowest total wrong submission penalty count.' },
                { rank: 4, title: 'Previous Round Benchmark', desc: 'Higher placement in prior prerequisite rounds.' },
              ].map((tb) => (
                <div
                  key={tb.rank}
                  className="p-3.5 rounded-lg border border-[#272B49] bg-[#0D1024] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-[#6D28D9]/20 text-[#8B5CF6] border border-[#6D28D9]/40 flex items-center justify-center font-bold text-xs">
                      #{tb.rank}
                    </span>
                    <div>
                      <span className="font-semibold text-[#F8FAFC] block">{tb.title}</span>
                      <span className="text-[11px] text-[#737D9D]">{tb.desc}</span>
                    </div>
                  </div>
                  <Badge variant="purple" size="sm">
                    Priority {tb.rank}
                  </Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Live Qualification Preview Table */}
      <Card>
        <CardHeader
          title="Live Qualification Preview"
          subtitle={`Current simulated standing cut-off based on active rules for ${selectedRound}`}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => showToast('Recalculated standings against backend test results.', 'success')}
              icon={<RefreshCw className="h-3 w-3" />}
            >
              Recalculate Standings
            </Button>
          }
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projected Rank</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Total Score</TableHead>
              <TableHead>Round Performance</TableHead>
              <TableHead>Projected Qualification</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedParticipants.map((p, index) => {
              const isAdvancing = index < currentQual.maxQualifiers;
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-[#F8FAFC]">
                      #{index + 1}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-semibold text-[#F8FAFC] block">{p.name}</span>
                      <span className="text-[11px] text-[#737D9D] font-mono">{p.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-[#10B981]">
                      {p.totalScore} pts
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-[#A5ADCA]">
                      Q: {p.roundScores.quiz} | C: {p.roundScores.coding} | D: {p.roundScores.debugging}
                    </span>
                  </TableCell>
                  <TableCell>
                    {isAdvancing ? (
                      <Badge variant="success" size="sm" dot>
                        Qualified for Next Round
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Knocked Out (Below Cut-off)
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
