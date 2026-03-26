'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

type Period = 'week' | 'month' | 'year';

interface BookEntry {
  bookId: string;
  bookTitle: string;
  bookAuthor?: string;
  bookCover?: string;
  finishedAt: string;
}

interface GoalWithBooks {
  period: Period;
  target: number | null;
  progress: number;
  books: BookEntry[];
}

const PERIOD_LABELS: Record<Period, string> = {
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
};

const ALL_PERIODS: Period[] = ['week', 'month', 'year'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function GoalCard({
  goal,
  onSave,
  onDelete,
}: {
  goal: GoalWithBooks;
  onSave: (period: Period, target: number) => Promise<void>;
  onDelete: (period: Period) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(String(goal.target ?? ''));
  const [saving, setSaving] = useState(false);
  const [showBooks, setShowBooks] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    const n = parseInt(input, 10);
    if (!n || n < 1) return;
    setSaving(true);
    await onSave(goal.period, n);
    setSaving(false);
    setEditing(false);
  };

  const pct = goal.target ? Math.min(100, Math.round((goal.progress / goal.target) * 100)) : 0;
  const reached = goal.target !== null && goal.progress >= goal.target;

  return (
    <div className="bg-[#faf7f4] dark:bg-[#1e1410] border border-[#ddd0c4] dark:border-[#3a2820] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#4d352a] dark:text-[#e8ddd8]">
          {PERIOD_LABELS[goal.period]}
        </h2>
        {!editing && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setEditing(true); setConfirmDelete(false); setInput(String(goal.target)); }}
              className="text-xs text-[#9a7559] dark:text-[#c5ae9b] hover:underline"
            >
              Edit
            </button>
            {confirmDelete ? (
              <>
                <button
                  onClick={() => onDelete(goal.period)}
                  className="text-xs text-red-500 hover:underline font-medium"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-[#9a7559] dark:text-[#c5ae9b] hover:underline"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-[#9a7559] dark:text-[#c5ae9b] hover:text-red-500 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-24 px-3 py-1.5 rounded-xl border border-[#ddd0c4] dark:border-[#3a2820] bg-white dark:bg-[#251a14] text-[#4d352a] dark:text-[#e8ddd8] text-sm focus:outline-none focus:ring-2 focus:ring-[#8d6548]"
              autoFocus
            />
            <span className="text-sm text-[#9a7559] dark:text-[#c5ae9b]">books</span>
            <button
              onClick={handleSave}
              disabled={saving || !input || parseInt(input) < 1}
              className="px-4 py-1.5 rounded-xl text-sm font-medium bg-[#8d6548] dark:bg-[#5a3d2c] text-[#f0eae5] disabled:opacity-50 hover:bg-[#7a5540] transition-colors"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => { setEditing(false); setInput(String(goal.target)); }}
              className="text-sm text-[#9a7559] dark:text-[#c5ae9b] hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <span className="text-2xl font-bold text-[#4d352a] dark:text-[#e8ddd8]">
              {goal.progress}
              <span className="text-base font-normal text-[#9a7559] dark:text-[#c5ae9b]">
                {' '}/ {goal.target} books
              </span>
            </span>

            <div className="w-full h-2.5 bg-[#e8ddd8] dark:bg-[#2e1e16] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${reached ? 'bg-green-500' : 'bg-[#8d6548]'}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <p className="text-sm text-[#8d6548] dark:text-[#c5ae9b]">
              {reached
                ? 'Goal reached!'
                : `${goal.target! - goal.progress} more ${goal.target! - goal.progress === 1 ? 'book' : 'books'} to go`}
            </p>
          </div>

          <button
            onClick={() => setShowBooks((v) => !v)}
            className="text-xs font-medium text-[#8d6548] dark:text-[#c5ae9b] hover:underline flex items-center gap-1"
          >
            {showBooks ? 'Hide books ▴' : 'See books ▾'}
          </button>

          {showBooks && (
            <div className="space-y-2 pt-1">
              {goal.books.length === 0 ? (
                <p className="text-sm text-[#c5ae9b] dark:text-[#5a4035]">No books finished yet in this period.</p>
              ) : (
                goal.books.map((b) => (
                  <div key={b.bookId} className="flex items-center gap-3">
                    {b.bookCover ? (
                      <Image
                        src={b.bookCover}
                        alt={b.bookTitle}
                        width={28}
                        height={42}
                        className="rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-[42px] rounded bg-[#e8ddd8] dark:bg-[#2e1e16] flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#4d352a] dark:text-[#e8ddd8] truncate">{b.bookTitle}</p>
                      <p className="text-xs text-[#9a7559] dark:text-[#c5ae9b] truncate">
                        {b.bookAuthor && `${b.bookAuthor} · `}{formatDate(b.finishedAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function GoalsPage() {
  const { user, loading: authLoading } = useAuth();
  const [goals, setGoals] = useState<GoalWithBooks[]>([]);
  const [loading, setLoading] = useState(true);

  // Add goal flow state
  const [addOpen, setAddOpen] = useState(false);
  const [addStep, setAddStep] = useState<'period' | 'count'>('period');
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [countInput, setCountInput] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  const fetchGoals = useCallback(async () => {
    const res = await fetch('/api/goals');
    if (res.ok) {
      const data = await res.json();
      setGoals(data.goals);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && user) fetchGoals();
    else if (!authLoading) setLoading(false);
  }, [authLoading, user, fetchGoals]);

  const handleSave = async (period: Period, target: number) => {
    await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period, target }),
    });
    await fetchGoals();
  };

  const handleDelete = async (period: Period) => {
    await fetch('/api/goals', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period }),
    });
    await fetchGoals();
  };

  const handleAddSave = async () => {
    if (!selectedPeriod) return;
    const n = parseInt(countInput, 10);
    if (!n || n < 1) return;
    setAddSaving(true);
    await handleSave(selectedPeriod, n);
    setAddSaving(false);
    setAddOpen(false);
    setAddStep('period');
    setSelectedPeriod(null);
    setCountInput('');
  };

  const openAdd = () => {
    setAddStep('period');
    setSelectedPeriod(null);
    setCountInput('');
    setAddOpen(true);
  };

  const closeAdd = () => {
    setAddOpen(false);
    setAddStep('period');
    setSelectedPeriod(null);
    setCountInput('');
  };

  if (authLoading || loading) {
    return <p className="text-[#c5ae9b] dark:text-[#7a6055] text-sm">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#4d352a] dark:text-[#e8ddd8]">Goals</h1>
        <p className="text-sm text-[#8d6548] dark:text-[#c5ae9b]">
          Please log in to set and track your reading goals.
        </p>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.target !== null);
  const setPeriods = new Set(activeGoals.map((g) => g.period));
  const unsetPeriods = ALL_PERIODS.filter((p) => !setPeriods.has(p));
  const allSet = unsetPeriods.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#4d352a] dark:text-[#e8ddd8]">Goals</h1>
        {!allSet && (
          <button
            onClick={openAdd}
            className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#8d6548] dark:bg-[#5a3d2c] text-[#f0eae5] hover:bg-[#7a5540] transition-colors"
          >
            + Add a goal
          </button>
        )}
      </div>

      {/* Add goal panel */}
      {addOpen && (
        <div className="bg-[#faf7f4] dark:bg-[#1e1410] border border-[#ddd0c4] dark:border-[#3a2820] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#4d352a] dark:text-[#e8ddd8]">
              {addStep === 'period' ? 'Choose a period' : `Goal for ${PERIOD_LABELS[selectedPeriod!]}`}
            </p>
            <button onClick={closeAdd} className="text-[#9a7559] dark:text-[#c5ae9b] text-sm hover:text-[#4d352a] dark:hover:text-[#e8ddd8]">
              ✕
            </button>
          </div>

          {addStep === 'period' ? (
            <div className="flex gap-2 flex-wrap">
              {unsetPeriods.map((p) => (
                <button
                  key={p}
                  onClick={() => { setSelectedPeriod(p); setAddStep('count'); }}
                  className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#f0eae5] dark:bg-[#251a14] border border-[#ddd0c4] dark:border-[#3a2820] text-[#8d6548] dark:text-[#c5ae9b] hover:border-[#9a7559] transition-colors"
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={countInput}
                onChange={(e) => setCountInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSave()}
                placeholder="e.g. 4"
                className="w-24 px-3 py-1.5 rounded-xl border border-[#ddd0c4] dark:border-[#3a2820] bg-white dark:bg-[#251a14] text-[#4d352a] dark:text-[#e8ddd8] text-sm focus:outline-none focus:ring-2 focus:ring-[#8d6548]"
                autoFocus
              />
              <span className="text-sm text-[#9a7559] dark:text-[#c5ae9b]">books</span>
              <button
                onClick={handleAddSave}
                disabled={addSaving || !countInput || parseInt(countInput) < 1}
                className="px-4 py-1.5 rounded-xl text-sm font-medium bg-[#8d6548] dark:bg-[#5a3d2c] text-[#f0eae5] disabled:opacity-50 hover:bg-[#7a5540] transition-colors"
              >
                {addSaving ? 'Adding…' : 'Add'}
              </button>
              <button
                onClick={() => setAddStep('period')}
                className="text-sm text-[#9a7559] dark:text-[#c5ae9b] hover:underline"
              >
                Back
              </button>
            </div>
          )}
        </div>
      )}

      {/* Goal cards */}
      {activeGoals.length === 0 && !addOpen ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-[#9a7559] dark:text-[#c5ae9b]">No current active goals.</p>
          <button
            onClick={openAdd}
            className="px-5 py-2 rounded-full text-sm font-medium bg-[#8d6548] dark:bg-[#5a3d2c] text-[#f0eae5] hover:bg-[#7a5540] transition-colors"
          >
            + Add a goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {activeGoals.map((goal) => (
            <GoalCard key={goal.period} goal={goal} onSave={handleSave} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
