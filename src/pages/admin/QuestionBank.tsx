import { useState } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Code,
  Bug,
  HelpCircle,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/layout/AdminLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/admin/ui/Table';
import { Badge, type BadgeVariant } from '../../components/admin/ui/Badge';
import { Button } from '../../components/admin/ui/Button';
import { Modal } from '../../components/admin/ui/Modal';
import { Tabs } from '../../components/admin/ui/Tabs';
import { ConfirmDialog } from '../../components/admin/ui/ConfirmDialog';
import { EmptyState } from '../../components/admin/ui/EmptyState';
import { adminDataService } from '../../services/adminDataService';
import { useToast } from '../../context/ToastContext';
import type { Question, RoundName, QuestionDifficulty, RoundType, TestCase } from '../../types/admin';

export default function QuestionBank() {
  const { showToast } = useToast();

  const [questions, setQuestions] = useState<Question[]>(() =>
    adminDataService.getQuestions()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRound, setSelectedRound] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Modal States
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editorActiveTab, setEditorActiveTab] = useState<'details' | 'testcases' | 'constraints' | 'solution'>('details');
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    round: RoundName;
    type: RoundType;
    difficulty: QuestionDifficulty;
    marks: number;
    description: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    inputDescription: string;
    outputDescription: string;
    constraints: string;
    sampleTestCases: TestCase[];
    hiddenTestCases: TestCase[];
    buggyCode: string;
    solutionCode: string;
    supportedLanguages: string[];
    executionTimeLimitMs: number;
    memoryLimitMb: number;
    partialScoring: boolean;
  }>({
    title: '',
    round: 'Coding Battle',
    type: 'coding',
    difficulty: 'medium',
    marks: 100,
    description: '',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'Option A',
    explanation: '',
    inputDescription: '',
    outputDescription: '',
    constraints: '1 <= N <= 10^5, Time limit: 2000ms, Memory limit: 512MB',
    sampleTestCases: [
      { id: 'sample-1', input: '4 2\n1 2', expectedOutput: '3', isHidden: false, weight: 20 },
    ],
    hiddenTestCases: [
      { id: 'hidden-1', input: '1000 500\n...', expectedOutput: '4820', isHidden: true, weight: 30 },
    ],
    buggyCode: '// Insert buggy code snippet here',
    solutionCode: '// Authoritative solution snippet',
    supportedLanguages: ['C++', 'Python', 'Java', 'Rust', 'Go'],
    executionTimeLimitMs: 2000,
    memoryLimitMb: 512,
    partialScoring: true,
  });

  // Confirm delete dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    question: Question | null;
  }>({
    isOpen: false,
    question: null,
  });

  const refreshList = () => {
    setQuestions(adminDataService.getQuestions());
  };

  const filtered = questions.filter((q) => {
    if (searchQuery && !q.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedRound !== 'all' && q.round !== selectedRound) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormData({
      title: '',
      round: 'Coding Battle',
      type: 'coding',
      difficulty: 'medium',
      marks: 100,
      description: '',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      explanation: '',
      inputDescription: '',
      outputDescription: '',
      constraints: '1 <= N <= 10^5, Time limit: 2000ms, Memory limit: 512MB',
      sampleTestCases: [
        { id: 'sample-1', input: '4 2\n1 2', expectedOutput: '3', isHidden: false, weight: 20 },
      ],
      hiddenTestCases: [
        { id: 'hidden-1', input: '1000 500\n...', expectedOutput: '4820', isHidden: true, weight: 30 },
      ],
      buggyCode: '',
      solutionCode: '',
      supportedLanguages: ['C++', 'Python', 'Java', 'Rust', 'Go'],
      executionTimeLimitMs: 2000,
      memoryLimitMb: 512,
      partialScoring: true,
    });
    setEditorActiveTab('details');
    setEditorModalOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setFormData({
      title: q.title,
      round: q.round,
      type: q.type,
      difficulty: q.difficulty,
      marks: q.marks,
      description: q.description,
      options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: String(q.correctAnswer || 'Option A'),
      explanation: q.explanation || '',
      inputDescription: q.inputDescription || '',
      outputDescription: q.outputDescription || '',
      constraints: q.constraints || '',
      sampleTestCases: q.sampleTestCases || [],
      hiddenTestCases: q.hiddenTestCases || [],
      buggyCode: q.buggyCode || '',
      solutionCode: q.solutionCode || '',
      supportedLanguages: q.supportedLanguages || ['C++', 'Python'],
      executionTimeLimitMs: q.executionTimeLimitMs || 2000,
      memoryLimitMb: q.memoryLimitMb || 512,
      partialScoring: q.partialScoring ?? true,
    });
    setEditorActiveTab('details');
    setEditorModalOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!formData.title.trim()) {
      showToast('Question title is required.', 'error');
      return;
    }

    if (editingQuestion) {
      adminDataService.updateQuestion(editingQuestion.id, {
        ...formData,
      });
      showToast(`Updated challenge '${formData.title}'.`, 'success');
    } else {
      adminDataService.addQuestion({
        ...formData,
      });
      showToast(`Added '${formData.title}' to question repository.`, 'success');
    }

    setEditorModalOpen(false);
    refreshList();
  };

  const handleDelete = (q: Question) => {
    setDeleteDialog({ isOpen: true, question: q });
  };

  const confirmDelete = () => {
    if (deleteDialog.question) {
      adminDataService.deleteQuestion(deleteDialog.question.id);
      showToast(`Removed '${deleteDialog.question.title}'.`, 'info');
      setDeleteDialog({ isOpen: false, question: null });
      refreshList();
    }
  };

  const getDifficultyBadge = (d: QuestionDifficulty) => {
    const map: Record<QuestionDifficulty, { variant: BadgeVariant; label: string }> = {
      easy: { variant: 'success', label: 'Easy' },
      medium: { variant: 'info', label: 'Medium' },
      hard: { variant: 'warning', label: 'Hard' },
      expert: { variant: 'error', label: 'Expert' },
    };
    const s = map[d];
    return <Badge variant={s.variant} size="sm">{s.label}</Badge>;
  };

  const getRoundTypeIcon = (type: RoundType) => {
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

  const editorTabs = [
    { id: 'details', label: 'Question Details' },
    { id: 'testcases', label: 'Test Cases' },
    { id: 'constraints', label: 'Constraints' },
    { id: 'solution', label: 'Solution (Admin Only)' },
  ];

  return (
    <AdminLayout
      title="Question Bank"
      subtitle="Manage challenge statements, test suites, and hidden evaluation vectors for all 4 rounds."
      action={
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          icon={<Plus className="h-4 w-4" />}
        >
          Add Question
        </Button>
      }
    >
      {/* Search & Filters */}
      <div className="bg-[#13162D] border border-[#272B49] rounded-xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#737D9D]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by challenge title..."
            className="w-full bg-[#0D1024] border border-[#272B49] focus:border-[#7C3AED] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F8FAFC] placeholder-[#737D9D] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto text-xs">
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
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-[#0D1024] border border-[#272B49] rounded-lg px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      {/* Questions Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No questions match filters"
          description="Try selecting a different round or search term."
          actionLabel="Add Question"
          onAction={handleOpenAdd}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Round</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((q) => (
              <TableRow key={q.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-[#0D1024] border border-[#272B49] flex items-center justify-center shrink-0">
                      {getRoundTypeIcon(q.type)}
                    </div>
                    <div>
                      <span className="font-semibold text-[#F8FAFC] block">{q.title}</span>
                      <span className="text-[11px] text-[#737D9D] line-clamp-1 max-w-md">
                        {q.description}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="uppercase text-[11px] font-mono text-[#A5ADCA]">
                    {q.type}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="purple" size="sm">
                    {q.round}
                  </Badge>
                </TableCell>
                <TableCell>{getDifficultyBadge(q.difficulty)}</TableCell>
                <TableCell>
                  <span className="font-mono font-bold text-xs text-[#10B981]">
                    {q.marks} pts
                  </span>
                </TableCell>
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setPreviewQuestion(q)}
                      title="Preview Participant View"
                      className="p-1.5 rounded-lg text-[#A5ADCA] hover:text-[#F8FAFC] hover:bg-[#191B38] transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(q)}
                      title="Edit Question"
                      className="p-1.5 rounded-lg text-[#A5ADCA] hover:text-[#8B5CF6] hover:bg-[#191B38] transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(q)}
                      title="Delete Question"
                      className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/15 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Question Editor Modal with 4 Organized Tabs */}
      <Modal
        isOpen={editorModalOpen}
        onClose={() => setEditorModalOpen(false)}
        title={editingQuestion ? 'Edit Challenge' : 'Add New Challenge to Bank'}
        subtitle="Manage question statement, test cases, and hidden official solutions."
        maxWidth="2xl"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setEditorModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveQuestion}>
              Save Question
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Editor Tabs Navigation */}
          <Tabs
            tabs={editorTabs}
            activeTab={editorActiveTab}
            onChange={(tabId) => setEditorActiveTab(tabId as any)}
          />

          {/* TAB 1: Details */}
          {editorActiveTab === 'details' && (
            <div className="space-y-3.5 text-xs animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                  Challenge Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Distributed Log Replay with Byzantine Faults"
                  className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#7C3AED] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                    Tournament Round
                  </label>
                  <select
                    value={formData.round}
                    onChange={(e) => {
                      const r = e.target.value as RoundName;
                      const typeMap: Record<RoundName, RoundType> = {
                        'Quiz Battle': 'quiz',
                        'Coding Battle': 'coding',
                        'Debugging Battle': 'debugging',
                        'Final Battle': 'final',
                      };
                      setFormData({ ...formData, round: r, type: typeMap[r] });
                    }}
                    className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-2.5 py-2 text-xs text-[#F8FAFC] focus:outline-none"
                  >
                    <option value="Quiz Battle">Quiz Battle</option>
                    <option value="Coding Battle">Coding Battle</option>
                    <option value="Debugging Battle">Debugging Battle</option>
                    <option value="Final Battle">Final Battle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value as QuestionDifficulty })
                    }
                    className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-2.5 py-2 text-xs text-[#F8FAFC] focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                    Assigned Marks
                  </label>
                  <input
                    type="number"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                    className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                  Problem Description / Question Prompt
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail the background, problem statement, and expected logic..."
                  className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
                />
              </div>

              {formData.type === 'quiz' && (
                <div className="p-3.5 rounded-lg border border-[#272B49] bg-[#0D1024] space-y-2.5">
                  <span className="text-xs font-semibold text-[#8B5CF6] block">
                    Multiple Choice Quiz Options
                  </span>
                  {formData.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#737D9D] w-5">#{i + 1}</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const copy = [...formData.options];
                          copy[i] = e.target.value;
                          setFormData({ ...formData, options: copy });
                        }}
                        className="flex-1 bg-[#13162D] border border-[#272B49] rounded px-2.5 py-1 text-xs text-[#F8FAFC] focus:outline-none"
                      />
                      <label className="flex items-center gap-1 text-[11px] text-[#A5ADCA] cursor-pointer">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={formData.correctAnswer === opt}
                          onChange={() => setFormData({ ...formData, correctAnswer: opt })}
                        />
                        Correct
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {formData.type === 'debugging' && (
                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                    Buggy Source Code Provided to Competitor
                  </label>
                  <textarea
                    rows={4}
                    value={formData.buggyCode}
                    onChange={(e) => setFormData({ ...formData, buggyCode: e.target.value })}
                    className="w-full bg-[#0D1024] font-mono text-[11px] border border-[#272B49] rounded-lg p-2.5 text-[#F8FAFC] focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Test Cases */}
          {editorActiveTab === 'testcases' && (
            <div className="space-y-4 text-xs animate-in fade-in">
              <div className="p-3 bg-[#0D1024] border border-[#272B49] rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-[#F8FAFC]">Sample Test Cases (Visible to Participant)</h4>
                  <p className="text-[11px] text-[#737D9D]">Displayed on challenge page for candidate debugging.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      sampleTestCases: [
                        ...formData.sampleTestCases,
                        { id: `sample-${Date.now()}`, input: '', expectedOutput: '', isHidden: false, weight: 10 },
                      ],
                    })
                  }
                >
                  + Add Sample Case
                </Button>
              </div>

              {formData.sampleTestCases.map((tc, idx) => (
                <div key={tc.id} className="p-3 bg-[#0D1024] border border-[#272B49] rounded-lg space-y-2">
                  <div className="flex items-center justify-between font-semibold text-[#A5ADCA]">
                    <span>Sample Case #{idx + 1}</span>
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          sampleTestCases: formData.sampleTestCases.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-[#EF4444] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[#737D9D] block mb-1">Input Stdin</span>
                      <textarea
                        rows={2}
                        value={tc.input}
                        onChange={(e) => {
                          const copy = [...formData.sampleTestCases];
                          copy[idx].input = e.target.value;
                          setFormData({ ...formData, sampleTestCases: copy });
                        }}
                        className="w-full bg-[#13162D] font-mono text-[11px] border border-[#272B49] rounded p-2 text-[#F8FAFC]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#737D9D] block mb-1">Expected Output</span>
                      <textarea
                        rows={2}
                        value={tc.expectedOutput}
                        onChange={(e) => {
                          const copy = [...formData.sampleTestCases];
                          copy[idx].expectedOutput = e.target.value;
                          setFormData({ ...formData, sampleTestCases: copy });
                        }}
                        className="w-full bg-[#13162D] font-mono text-[11px] border border-[#272B49] rounded p-2 text-[#F8FAFC]"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-3 bg-[#0D1024] border border-[#6D28D9]/40 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-[#8B5CF6]">Hidden Evaluation Test Cases (Admin Only)</h4>
                  <p className="text-[11px] text-[#737D9D]">Strictly confidential. Evaluated exclusively by backend sandbox.</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      hiddenTestCases: [
                        ...formData.hiddenTestCases,
                        { id: `hidden-${Date.now()}`, input: '', expectedOutput: '', isHidden: true, weight: 20 },
                      ],
                    })
                  }
                >
                  + Add Hidden Vector
                </Button>
              </div>

              {formData.hiddenTestCases.map((tc, idx) => (
                <div key={tc.id} className="p-3 bg-[#0D1024] border border-[#272B49] rounded-lg space-y-2">
                  <div className="flex items-center justify-between font-semibold text-[#A5ADCA]">
                    <span>Hidden Vector #{idx + 1}</span>
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          hiddenTestCases: formData.hiddenTestCases.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-[#EF4444] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[#737D9D] block mb-1">Stress Input Stdin</span>
                      <textarea
                        rows={2}
                        value={tc.input}
                        onChange={(e) => {
                          const copy = [...formData.hiddenTestCases];
                          copy[idx].input = e.target.value;
                          setFormData({ ...formData, hiddenTestCases: copy });
                        }}
                        className="w-full bg-[#13162D] font-mono text-[11px] border border-[#272B49] rounded p-2 text-[#F8FAFC]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#737D9D] block mb-1">Expected Output</span>
                      <textarea
                        rows={2}
                        value={tc.expectedOutput}
                        onChange={(e) => {
                          const copy = [...formData.hiddenTestCases];
                          copy[idx].expectedOutput = e.target.value;
                          setFormData({ ...formData, hiddenTestCases: copy });
                        }}
                        className="w-full bg-[#13162D] font-mono text-[11px] border border-[#272B49] rounded p-2 text-[#F8FAFC]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Constraints */}
          {editorActiveTab === 'constraints' && (
            <div className="space-y-4 text-xs animate-in fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                    Execution Time Limit (Milliseconds)
                  </label>
                  <input
                    type="number"
                    value={formData.executionTimeLimitMs}
                    onChange={(e) =>
                      setFormData({ ...formData, executionTimeLimitMs: Number(e.target.value) })
                    }
                    className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                    Memory Limit (MB)
                  </label>
                  <input
                    type="number"
                    value={formData.memoryLimitMb}
                    onChange={(e) =>
                      setFormData({ ...formData, memoryLimitMb: Number(e.target.value) })
                    }
                    className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                  Constraints Text
                </label>
                <textarea
                  rows={3}
                  value={formData.constraints}
                  onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                  placeholder="e.g. 1 <= T <= 100, 1 <= N <= 10^5, Integers within 64-bit signed bounds."
                  className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                  Supported Programming Environments
                </label>
                <input
                  type="text"
                  value={formData.supportedLanguages.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      supportedLanguages: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  placeholder="C++, Python, Java, Rust, Go"
                  className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg px-3 py-2 text-xs text-[#F8FAFC]"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Solution — Admin Only */}
          {editorActiveTab === 'solution' && (
            <div className="space-y-4 text-xs animate-in fade-in">
              <div className="p-3 bg-[#6D28D9]/15 border border-[#6D28D9]/40 rounded-lg flex items-center gap-2.5 text-[#8B5CF6]">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>
                  Admin Safeguard: This official solution is strictly hidden and never served to client participant APIs.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                  Authoritative Reference Solution
                </label>
                <textarea
                  rows={8}
                  value={formData.solutionCode}
                  onChange={(e) => setFormData({ ...formData, solutionCode: e.target.value })}
                  placeholder="// Paste tested, optimal solution here..."
                  className="w-full bg-[#0D1024] font-mono text-[11px] border border-[#272B49] rounded-lg p-3 text-[#F8FAFC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                  Editorial Explanation &amp; Complexity Bounds
                </label>
                <textarea
                  rows={3}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Explain the optimal algorithmic time & space complexities..."
                  className="w-full bg-[#0D1024] border border-[#272B49] rounded-lg p-3 text-xs text-[#F8FAFC] focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Question Preview Modal (Participant Rendering Preview) */}
      {previewQuestion && (
        <Modal
          isOpen={Boolean(previewQuestion)}
          onClose={() => setPreviewQuestion(null)}
          title={`Preview: ${previewQuestion.title}`}
          subtitle={`${previewQuestion.round} • ${previewQuestion.difficulty.toUpperCase()} • ${previewQuestion.marks} Marks`}
          maxWidth="lg"
          footer={
            <Button variant="outline" size="sm" onClick={() => setPreviewQuestion(null)}>
              Close Preview
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-lg bg-[#0D1024] border border-[#272B49]">
              <h4 className="font-semibold text-[#F8FAFC] text-sm mb-2">Problem Statement</h4>
              <p className="text-[#A5ADCA] leading-relaxed whitespace-pre-wrap">
                {previewQuestion.description}
              </p>
            </div>

            {previewQuestion.options && (
              <div className="space-y-2">
                <span className="font-semibold text-[#F8FAFC]">Options:</span>
                {previewQuestion.options.map((opt, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded bg-[#0D1024] border border-[#272B49] flex items-center justify-between"
                  >
                    <span className="text-[#A5ADCA]">{opt}</span>
                    {previewQuestion.correctAnswer === opt && (
                      <Badge variant="success" size="sm">
                        Correct Answer (Admin Flag)
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {previewQuestion.constraints && (
              <div className="p-3 rounded bg-[#0D1024] border border-[#272B49]">
                <span className="text-[#737D9D] font-mono text-[10px] uppercase tracking-wider block mb-1">
                  Constraints
                </span>
                <span className="font-mono text-[11px] text-[#A5ADCA]">
                  {previewQuestion.constraints}
                </span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, question: null })}
        onConfirm={confirmDelete}
        title="Delete Challenge"
        description={`Are you sure you want to permanently remove '${deleteDialog.question?.title}' from the question bank?`}
        variant="danger"
        confirmLabel="Delete Challenge"
      />
    </AdminLayout>
  );
}
