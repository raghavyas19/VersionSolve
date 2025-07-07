import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  X,
  Clock,
  MemoryStick
} from 'lucide-react';
import { Problem, TestCase } from '../../types';
import { DIFFICULTY_COLORS } from '../../utils/constants';
import { clsx } from 'clsx';
import {
  fetchProblems,
  createProblem,
  adminVerify,
  getAdminCsrfToken,
  updateProblem,
  deleteProblem,
  createDraftProblem,
  fetchDraftProblems,
  updateDraftProblem,
  deleteDraftProblem,
  publishDraftProblem,
  toggleProblemVisibility
} from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const ProblemManager: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [admin, setAdmin] = useState<any>(null);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
    tags: '',
    timeLimit: 1,
    memoryLimit: 256,
    points: 100,
    isPublic: true,
    examples: [{ input: '', output: '', explanation: '' }],
    testCases: [{ input: '', output: '', isHidden: false, points: 10 }]
  });

  const [touched, setTouched] = useState<any>({});
  const [fieldErrors, setFieldErrors] = useState<any>({});

  const [drafts, setDrafts] = useState<any[]>([]);
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);

  const showToast = (message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  };

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await adminVerify();
        setAdmin(res.admin);
      } catch {
        localStorage.removeItem('token');
        navigate('/admin/auth', { replace: true });
      }
    };
    fetchAdmin();
    getAdminCsrfToken().then(setCsrfToken);
  }, [navigate]);

  useEffect(() => {
    const loadProblems = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProblems();
        setProblems(data);
      } catch (err: any) {
        setError('Failed to load problems');
      } finally {
        setLoading(false);
      }
    };
    loadProblems();
  }, []);

  useEffect(() => {
    const loadDrafts = async () => {
      if (admin?.username) {
        try {
          const data = await fetchDraftProblems(admin.username);
          setDrafts(data);
        } catch (err) {
          // Optionally handle error
        }
      }
    };
    loadDrafts();
  }, [admin]);

  const handleSaveProblem = async () => {
    const errors: any = {};
    if (!formData.title || formData.title.trim().length < 5) {
      errors.title = 'Title is required and must be at least 5 characters.';
    }
    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = 'Description is required and must be at least 10 characters.';
    }
    if (!formData.difficulty || !['Easy', 'Medium', 'Hard'].includes(formData.difficulty)) {
      errors.difficulty = 'Difficulty is required.';
    }
    if (!formData.testCases || formData.testCases.length < 1) {
      errors.testCases = 'At least one test case is required.';
    } else {
      errors.testCases = formData.testCases.map((tc: any, i: number) => {
        const tcErr: any = {};
        if (!tc.input || tc.input.trim() === '') tcErr.input = 'Please fill this field';
        if (!tc.output || tc.output.trim() === '') tcErr.output = 'Please fill this field';
        return tcErr;
      });
    }
    setFieldErrors(errors);
    setTouched({
      title: true,
      description: true,
      difficulty: true,
      testCases: formData.testCases.map(() => ({ input: true, output: true })),
    });
    if (
      errors.title ||
      errors.description ||
      errors.difficulty ||
      (errors.testCases && errors.testCases.some((tc: any) => tc.input || tc.output))
    ) {
      return;
    }
    setSaving(true);
    try {
      const newProblem: any = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        timeLimit: formData.timeLimit,
        memoryLimit: formData.memoryLimit,
        points: formData.points,
        isPublic: formData.isPublic,
        examples: formData.examples.filter(ex => ex.input || ex.output),
        testCases: formData.testCases.map((tc, index) => ({
          id: `tc-${index}`,
          input: tc.input,
          expectedOutput: tc.output,
          isHidden: tc.isHidden,
          points: tc.points
        })),
        submissions: editingProblem?.submissions || 0,
        acceptanceRate: editingProblem?.acceptanceRate || 0,
        author: admin?.username || 'admin',
      };
      if (editingProblem) {
        const { problem } = await updateProblem(editingProblem.id, newProblem);
        setProblems(problems.map(p => p.id === editingProblem.id ? problem : p));
      } else {
        const { problem } = await createProblem(newProblem, csrfToken);
        setProblems([...problems, problem]);
      }
      setShowCreateModal(false);
    } catch (err) {
      setError('Failed to save problem');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    // Only allow saving if title is present
    if (!formData.title) {
      showToast('Title is required to save a draft.');
      return;
    }
    setSaving(true);
    try {
      const draftData: any = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        timeLimit: formData.timeLimit,
        memoryLimit: formData.memoryLimit,
        points: formData.points,
        isPublic: false,
        examples: formData.examples.filter(ex => ex.input || ex.output),
        testCases: formData.testCases.map((tc, index) => ({
          id: `tc-${index}`,
          input: tc.input,
          expectedOutput: tc.output,
          isHidden: tc.isHidden,
          points: tc.points
        })),
        submissions: editingProblem?.submissions || 0,
        acceptanceRate: editingProblem?.acceptanceRate || 0,
        author: admin?.username || 'admin',
      };
      if (editingProblem && (editingProblem as any)._isDraft) {
        const { draft } = await updateDraftProblem((editingProblem as any)._id, draftData);
      } else {
        const { draft } = await createDraftProblem(draftData);
      }
      // Always re-fetch drafts after saving
      if (admin?.username) {
        const data = await fetchDraftProblems(admin.username);
        setDrafts(data);
      }
      setShowCreateModal(false);
    } catch (err) {
      setError('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const handleCreateProblem = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'Easy',
      tags: '',
      timeLimit: 1,
      memoryLimit: 256,
      points: 100,
      isPublic: true,
      examples: [{ input: '', output: '', explanation: '' }],
      testCases: [{ input: '', output: '', isHidden: false, points: 10 }]
    });
    setEditingProblem(null);
    setShowCreateModal(true);
  };

  const handleEditProblem = (problem: Problem) => {
    setFormData({
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      tags: problem.tags.join(', '),
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
      points: problem.points || 100,
      isPublic: problem.isPublic ?? true,
      examples: problem.examples.length > 0 ? problem.examples.map(ex => ({
        input: ex.input,
        output: ex.output,
        explanation: ex.explanation || ''
      })) : [{ input: '', output: '', explanation: '' }],
      testCases: problem.testCases.map(tc => ({
        input: tc.input,
        output: (tc as any).output || (tc as any).expectedOutput || '',
        isHidden: tc.isHidden,
        points: tc.points || 10
      }))
    });
    setEditingProblem(problem);
    setShowCreateModal(true);
  };

  const handleDeleteProblem = async (problemId: string) => {
    if (confirm('Are you sure you want to delete this problem?')) {
      try {
        await deleteProblem(problemId);
        setProblems(problems.filter(p => p.id !== problemId));
      } catch (err) {
        alert('Failed to delete problem');
      }
    }
  };

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { input: '', output: '', explanation: '' }]
    });
  };

  const removeExample = (index: number) => {
    setFormData({
      ...formData,
      examples: formData.examples.filter((_, i) => i !== index)
    });
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: '', output: '', isHidden: false, points: 10 }]
    });
  };

  const removeTestCase = (index: number) => {
    setFormData({
      ...formData,
      testCases: formData.testCases.filter((_, i) => i !== index)
    });
  };

  const handleEditDraft = (draft: any) => {
    setFormData({
      title: draft.title,
      description: draft.description || '',
      difficulty: draft.difficulty || 'Easy',
      tags: (draft.tags || []).join(', '),
      timeLimit: draft.timeLimit || 1,
      memoryLimit: draft.memoryLimit || 256,
      points: draft.points || 100,
      isPublic: false,
      examples: draft.examples?.length > 0 ? draft.examples : [{ input: '', output: '', explanation: '' }],
      testCases: draft.testCases?.length > 0 ? draft.testCases.map((tc: any) => ({
        input: tc.input,
        output: tc.expectedOutput || tc.output || '',
        isHidden: tc.isHidden,
        points: tc.points || 10
      })) : [{ input: '', output: '', isHidden: false, points: 10 }]
    });
    setEditingProblem({ ...(draft as any), _isDraft: true });
    setShowCreateModal(true);
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      try {
        await deleteDraftProblem(draftId);
        setDrafts(drafts.filter(d => d._id !== draftId));
      } catch (err) {
        alert('Failed to delete draft');
      }
    }
  };

  const handlePublishDraft = async (draft: any) => {
    // Validate required fields before calling publish
    const missing: string[] = [];
    if (!draft.title) missing.push('Title');
    if (!draft.description) missing.push('Description');
    if (!draft.difficulty) missing.push('Difficulty');
    if (!draft.testCases || draft.testCases.length === 0) missing.push('Test Cases');
    if (missing.length > 0) {
      showToast('Cannot publish: missing ' + missing.join(', '));
      return;
    }
    try {
      const { problem } = await publishDraftProblem(draft._id);
      setProblems([...problems, problem]);
      setDrafts(drafts.filter(d => d._id !== draft._id));
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to publish draft');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading problems...</div>;
  }
  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6 overflow-x-hidden px-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Problem Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create, edit, and manage programming problems.
          </p>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Total Problems: {problems.filter(p => p.isPublic).length}
          </div>
        </div>
        
        <button
          onClick={handleCreateProblem}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Problem</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Drafts Table (above main table) */}
      {admin && drafts.length > 0 && (
        <div className="mb-6 max-w-md">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Your Drafts</h2>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px]">
                <thead className="bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-0 py-2 w-8 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-300 dark:border-gray-700">#</th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {drafts.map((draft, idx) => (
                    <tr key={draft._id || idx} className="bg-gray-50 dark:bg-gray-900">
                      <td className="px-0 py-2 w-8 text-sm text-gray-500 dark:text-gray-400 font-semibold border-r border-gray-300 dark:border-gray-700 text-center">{idx + 1}</td>
                      <td className="px-2 py-2 text-sm font-medium text-gray-900 dark:text-white text-center truncate max-w-[120px]">{draft.title}</td>
                      <td className="px-2 py-2 text-sm">
                        <div className="flex gap-2 items-center">
                          <button onClick={() => handleEditDraft(draft)} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDeleteDraft(draft._id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"><Trash2 className="h-4 w-4" /></button>
                          <button
                            onClick={() => handlePublishDraft(draft)}
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                          >
                            Publish
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Card layout for mobile */}
      <div className="md:hidden space-y-3">
        {filteredProblems.map((problem) => (
          <div key={problem.id} className="w-full rounded-lg shadow border p-3 bg-[var(--color-surface)] flex flex-col gap-1 text-sm break-words">
            <div className="flex items-center justify-between w-full">
              <div className="font-bold text-blue-600 dark:text-blue-400 text-base truncate w-3/4 break-words">{problem.title}</div>
              <span className={clsx(
                'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                DIFFICULTY_COLORS[problem.difficulty]
              )}>
                {problem.difficulty}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 text-xs text-gray-500 dark:text-gray-400 w-full break-words">
              {problem.tags.map((tag, idx) => (
                <span key={tag + '-' + idx} className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded break-words">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs w-full break-words">
              <span>{problem.uniqueUserSubmissions ?? 0} unique users</span>
              <span>{problem.acceptanceRate.toFixed(1)}% accepted</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs w-full break-words">
              <span>Time: {problem.timeLimit}s</span>
              <span>Memory: {problem.memoryLimit}MB</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs w-full break-words">
              <span>Status: {problem.isPublic ? 'Public' : 'Draft'}</span>
              <span>Points: {problem.points}</span>
            </div>
            <div className="flex gap-1 mt-1 w-full">
              <button
                onClick={() => handleEditProblem(problem)}
                className="flex-1 p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-700 rounded transition-colors text-xs"
              >
                Edit
              </button>
              <button
                className="flex-1 p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded transition-colors text-xs"
              >
                View
              </button>
              <button
                onClick={() => handleDeleteProblem(problem.id)}
                className="flex-1 p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-700 rounded transition-colors text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Table layout for desktop */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-0 py-2 w-12 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-300 dark:border-gray-700">#</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Problem</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Difficulty</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Limits</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stats</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Author</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProblems.map((problem, idx) => (
                <tr key={problem.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-0 py-4 w-12 border-r border-gray-300 dark:border-gray-700 text-center">{idx + 1}</td>
                  <td className="px-3 py-4 text-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {problem.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {problem.tags.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <span className={clsx(
                      'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                      DIFFICULTY_COLORS[problem.difficulty]
                    )}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <div className="flex items-center justify-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>{problem.timeLimit}s</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MemoryStick className="h-3 w-3 text-gray-400" />
                        <span>{problem.memoryLimit}MB</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <div>
                      <div>{problem.uniqueUserSubmissions ?? 0} Submissions</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {problem.acceptanceRate.toFixed(1)}% accepted
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <select
                      className={clsx(
                        'inline-flex px-2 py-1 text-xs font-medium rounded-full cursor-pointer',
                        problem.visible
                          ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
                          : 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'
                      )}
                      value={problem.visible ? 'visible' : 'hidden'}
                      onChange={async (e) => {
                        const newVisible = e.target.value === 'visible';
                        if (newVisible !== problem.visible) {
                          try {
                            const { visible } = await toggleProblemVisibility(problem.id);
                            setProblems(problems.map(p => p.id === problem.id ? { ...p, visible } : p));
                          } catch {
                            alert('Failed to update visibility');
                          }
                        }
                      }}
                      title={problem.visible ? 'Set to hidden' : 'Set to visible'}
                    >
                      <option value="visible">Visible</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </td>
                  <td className="px-3 py-4 text-center">{problem.author}</td>
                  <td className="px-3 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEditProblem(problem)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProblem(problem.id)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingProblem ? 'Edit Problem' : 'Create New Problem'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-3 py-2 border ${fieldErrors.title && touched.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter problem title"
                  />
                  {fieldErrors.title && touched.title && (
                    <div className="text-xs text-red-500 mt-1">{fieldErrors.title}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className={`w-full px-3 py-2 border ${fieldErrors.difficulty && touched.difficulty ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  {fieldErrors.difficulty && touched.difficulty && (
                    <div className="text-xs text-red-500 mt-1">{fieldErrors.difficulty}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Limit (seconds) *
                  </label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: Number(e.target.value) })}
                    className={`w-full px-3 py-2 border ${fieldErrors.timeLimit && touched.timeLimit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    min="1"
                    max="30"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max allowed: 30 seconds</p>
                  {fieldErrors.timeLimit && touched.timeLimit && (
                    <div className="text-xs text-red-500 mt-1">{fieldErrors.timeLimit}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Memory Limit (MB) *
                  </label>
                  <input
                    type="number"
                    value={formData.memoryLimit}
                    onChange={(e) => setFormData({ ...formData, memoryLimit: Number(e.target.value) })}
                    className={`w-full px-3 py-2 border ${fieldErrors.memoryLimit && touched.memoryLimit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    min="64"
                    max="1024"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max allowed: 1024 MB</p>
                  {fieldErrors.memoryLimit && touched.memoryLimit && (
                    <div className="text-xs text-red-500 mt-1">{fieldErrors.memoryLimit}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                    className={`w-full px-3 py-2 border ${fieldErrors.points && touched.points ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    min="10"
                    max="1000"
                  />
                  {fieldErrors.points && touched.points && (
                    <div className="text-xs text-red-500 mt-1">{fieldErrors.points}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className={`w-full px-3 py-2 border ${fieldErrors.tags && touched.tags ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Array, Dynamic Programming, Graph"
                  />
                  {fieldErrors.tags && touched.tags && (
                    <div className="text-xs text-red-500 mt-1">{fieldErrors.tags}</div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Problem Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={8}
                  className={`w-full px-3 py-2 border ${fieldErrors.description && touched.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter problem description with constraints and requirements..."
                />
                {fieldErrors.description && touched.description && (
                  <div className="text-xs text-red-500 mt-1">{fieldErrors.description}</div>
                )}
              </div>

              {/* Examples */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Examples
                  </label>
                  <button
                    onClick={addExample}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Example</span>
                  </button>
                </div>
                
                {formData.examples.map((example, idx) => (
                  <div key={idx} className="mb-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Example {idx + 1}
                      </span>
                      {formData.examples.length > 1 && (
                        <button
                          onClick={() => removeExample(idx)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Input</label>
                        <textarea
                          value={example.input}
                          onChange={(e) => {
                            const newExamples = [...formData.examples];
                            newExamples[idx].input = e.target.value;
                            setFormData({ ...formData, examples: newExamples });
                            setTouched((prev: any) => ({
                              ...prev,
                              examples: prev.examples ? prev.examples.map((ex: any, i: number) => i === idx ? { ...ex, input: true } : ex) : []
                            }));
                          }}
                          rows={3}
                          className={`w-full px-2 py-1 text-sm border ${fieldErrors.examples && fieldErrors.examples[idx] && fieldErrors.examples[idx].input && touched.examples && touched.examples[idx]?.input ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent`}
                        />
                        {fieldErrors.examples && fieldErrors.examples[idx] && fieldErrors.examples[idx].input && touched.examples && touched.examples[idx]?.input && (
                          <div className="text-xs text-red-500 mt-1">{fieldErrors.examples[idx].input}</div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Output</label>
                        <textarea
                          value={example.output}
                          onChange={(e) => {
                            const newExamples = [...formData.examples];
                            newExamples[idx].output = e.target.value;
                            setFormData({ ...formData, examples: newExamples });
                            setTouched((prev: any) => ({
                              ...prev,
                              examples: prev.examples ? prev.examples.map((ex: any, i: number) => i === idx ? { ...ex, output: true } : ex) : []
                            }));
                          }}
                          rows={3}
                          className={`w-full px-2 py-1 text-sm border ${fieldErrors.examples && fieldErrors.examples[idx] && fieldErrors.examples[idx].output && touched.examples && touched.examples[idx]?.output ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent`}
                        />
                        {fieldErrors.examples && fieldErrors.examples[idx] && fieldErrors.examples[idx].output && touched.examples && touched.examples[idx]?.output && (
                          <div className="text-xs text-red-500 mt-1">{fieldErrors.examples[idx].output}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Explanation (optional)</label>
                      <input
                        type="text"
                        value={example.explanation || ''}
                        onChange={(e) => {
                          const newExamples = [...formData.examples];
                          newExamples[idx].explanation = e.target.value;
                          setFormData({ ...formData, examples: newExamples });
                          setTouched((prev: any) => ({
                            ...prev,
                            examples: prev.examples ? prev.examples.map((ex: any, i: number) => i === idx ? { ...ex, explanation: true } : ex) : []
                          }));
                        }}
                        className={`w-full px-2 py-1 text-sm border ${fieldErrors.examples && fieldErrors.examples[idx] && fieldErrors.examples[idx].explanation && touched.examples && touched.examples[idx]?.explanation ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent`}
                      />
                      {fieldErrors.examples && fieldErrors.examples[idx] && fieldErrors.examples[idx].explanation && touched.examples && touched.examples[idx]?.explanation && (
                        <div className="text-xs text-red-500 mt-1">{fieldErrors.examples[idx].explanation}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Test Cases */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Test Cases *
                  </label>
                  <button
                    onClick={addTestCase}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Test Case</span>
                  </button>
                </div>
                
                {formData.testCases.map((testCase, idx) => (
                  <div key={idx} className="mb-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Test Case {idx + 1}
                      </span>
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={testCase.isHidden}
                            onChange={(e) => {
                              const newTestCases = [...formData.testCases];
                              newTestCases[idx].isHidden = e.target.checked;
                              setFormData({ ...formData, testCases: newTestCases });
                              setTouched((prev: any) => ({
                                ...prev,
                                testCases: prev.testCases ? prev.testCases.map((tc: any, i: number) => i === idx ? { ...tc, isHidden: true } : tc) : []
                              }));
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Hidden</span>
                        </label>
                        {formData.testCases.length > 1 && (
                          <button
                            onClick={() => removeTestCase(idx)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Input *</label>
                        <textarea
                          value={testCase.input}
                          onChange={(e) => {
                            const newTestCases = [...formData.testCases];
                            newTestCases[idx].input = e.target.value;
                            setFormData({ ...formData, testCases: newTestCases });
                            setTouched((prev: any) => ({
                              ...prev,
                              testCases: prev.testCases ? prev.testCases.map((tc: any, i: number) => i === idx ? { ...tc, input: true } : tc) : []
                            }));
                          }}
                          rows={3}
                          className={`w-full px-2 py-1 text-sm border ${fieldErrors.testCases && fieldErrors.testCases[idx] && fieldErrors.testCases[idx].input && touched.testCases && touched.testCases[idx]?.input ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent`}
                        />
                        {fieldErrors.testCases && fieldErrors.testCases[idx] && fieldErrors.testCases[idx].input && touched.testCases && touched.testCases[idx]?.input && (
                          <div className="text-xs text-red-500 mt-1">{fieldErrors.testCases[idx].input}</div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Output *</label>
                        <textarea
                          value={testCase.output}
                          onChange={(e) => {
                            const newTestCases = [...formData.testCases];
                            newTestCases[idx].output = e.target.value;
                            setFormData({ ...formData, testCases: newTestCases });
                            setTouched((prev: any) => ({
                              ...prev,
                              testCases: prev.testCases ? prev.testCases.map((tc: any, i: number) => i === idx ? { ...tc, output: true } : tc) : []
                            }));
                          }}
                          rows={3}
                          className={`w-full px-2 py-1 text-sm border ${fieldErrors.testCases && fieldErrors.testCases[idx] && fieldErrors.testCases[idx].output && touched.testCases && touched.testCases[idx]?.output ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent`}
                        />
                        {fieldErrors.testCases && fieldErrors.testCases[idx] && fieldErrors.testCases[idx].output && touched.testCases && touched.testCases[idx]?.output && (
                          <div className="text-xs text-red-500 mt-1">{fieldErrors.testCases[idx].output}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Points</label>
                      <input
                        type="number"
                        value={testCase.points}
                        onChange={(e) => {
                          const newTestCases = [...formData.testCases];
                          newTestCases[idx].points = Number(e.target.value);
                          setFormData({ ...formData, testCases: newTestCases });
                          setTouched((prev: any) => ({
                            ...prev,
                            testCases: prev.testCases ? prev.testCases.map((tc: any, i: number) => i === idx ? { ...tc, points: true } : tc) : []
                          }));
                        }}
                        min="1"
                        max="100"
                        className={`w-24 px-2 py-1 text-sm border ${fieldErrors.testCases && fieldErrors.testCases[idx] && fieldErrors.testCases[idx].points && touched.testCases && touched.testCases[idx]?.points ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent`}
                      />
                      {fieldErrors.testCases && fieldErrors.testCases[idx] && fieldErrors.testCases[idx].points && touched.testCases && touched.testCases[idx]?.points && (
                        <div className="text-xs text-red-500 mt-1">{fieldErrors.testCases[idx].points}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Make this problem public</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDraft}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                <span>Save as Draft</span>
              </button>
              <button
                onClick={handleSaveProblem}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>{editingProblem ? 'Update Problem' : 'Add Problem'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render toasts at the top-right */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="bg-red-600 text-white px-4 py-2 rounded shadow text-sm animate-fade-in-out">
            {toast.message}
          </div>
        ))}
      </div>

      <style>{`
      @keyframes fade-in-out {
        0% { opacity: 0; transform: translateY(-10px); }
        10% { opacity: 1; transform: translateY(0); }
        90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-10px); }
      }
      .animate-fade-in-out {
        animation: fade-in-out 2s both;
      }
      `}</style>
    </div>
  );
};

export default ProblemManager;