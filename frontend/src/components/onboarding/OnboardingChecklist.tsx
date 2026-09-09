/* eslint-disable react-refresh/only-export-components */
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, X } from 'lucide-react';

// === Types

export interface ChecklistTask {
  /** Stable id persisted in localStorage */
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  /** Route pushed when the user starts the task */
  actionPath: string;
}

export interface OnboardingChecklistProps {
  /** Ordered tasks; defaults to the standard new-company checklist */
  tasks?: ChecklistTask[];
  /** Called after the card is dismissed or every task is done */
  onDismiss?: () => void;
}

interface ChecklistState {
  completed: string[];
  dismissed: boolean;
}

// === Storage helpers

const STORAGE_KEY = 'navin_onboarding_checklist';

const EMPTY_STATE: ChecklistState = { completed: [], dismissed: false };

export function readChecklistState(): ChecklistState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return EMPTY_STATE;
    const value = parsed as Partial<ChecklistState>;
    return {
      completed: Array.isArray(value.completed) ? value.completed : [],
      dismissed: value.dismissed === true,
    };
  } catch {
    return EMPTY_STATE;
  }
}

function writeChecklistState(state: ChecklistState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable, checklist simply won't persist
  }
}

/** Mark a task complete from anywhere in the app (e.g. after a shipment is created) */
export function markChecklistTaskComplete(taskId: string): void {
  const state = readChecklistState();
  if (state.completed.includes(taskId)) return;
  writeChecklistState({ ...state, completed: [...state.completed, taskId] });
}

/** Reset the checklist so it shows again (used by the Help Center) */
export function resetChecklist(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const DEFAULT_CHECKLIST_TASKS: ChecklistTask[] = [
  {
    id: 'complete-profile',
    title: 'Complete your profile',
    description: 'Add your company details so partners can identify your shipments.',
    actionLabel: 'Open settings',
    actionPath: '/dashboard/company-settings',
  },
  {
    id: 'connect-wallet',
    title: 'Connect a Stellar wallet',
    description: 'Required to sign settlement transactions on-chain.',
    actionLabel: 'Connect wallet',
    actionPath: '/dashboard/settings',
  },
  {
    id: 'create-shipment',
    title: 'Create your first shipment',
    description: 'Register a shipment and track its milestones in real time.',
    actionLabel: 'Create shipment',
    actionPath: '/dashboard/shipments/create',
  },
  {
    id: 'invite-team',
    title: 'Invite a teammate',
    description: 'Give your operations team access to the dashboard.',
    actionLabel: 'Invite team',
    actionPath: '/dashboard/team',
  },
];

// === Component

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  tasks = DEFAULT_CHECKLIST_TASKS,
  onDismiss,
}) => {
  const navigate = useNavigate();
  const [state, setState] = useState<ChecklistState>(() => readChecklistState());

  const persist = useCallback((next: ChecklistState) => {
    setState(next);
    writeChecklistState(next);
  }, []);

  const toggleTask = (taskId: string) => {
    const completed = state.completed.includes(taskId)
      ? state.completed.filter((id) => id !== taskId)
      : [...state.completed, taskId];
    persist({ ...state, completed });
  };

  const dismiss = () => {
    persist({ ...state, dismissed: true });
    onDismiss?.();
  };

  if (state.dismissed) return null;

  const doneCount: number = tasks.filter((task) => state.completed.includes(task.id)).length;
  const allDone: boolean = doneCount === tasks.length;
  const percent: number = Math.round((doneCount / tasks.length) * 100);

  return (
    <section
      aria-labelledby="onboarding-checklist-heading"
      className="bg-[#14171e] border border-[#1e293b] rounded-xl p-6 max-md:p-4"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2
            id="onboarding-checklist-heading"
            className="text-base font-semibold text-white m-0 mb-1"
          >
            {allDone ? "You're all set 🎉" : 'Get started with Navin'}
          </h2>
          <p className="text-sm text-[#94a3b8] m-0">
            {allDone
              ? 'Every setup step is complete. You can dismiss this card.'
              : `${doneCount} of ${tasks.length} steps complete`}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss onboarding checklist"
          className="shrink-0 rounded-md border border-[#1e293b] bg-transparent p-1.5 text-[#94a3b8] cursor-pointer transition-colors hover:border-[#334155] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#62ffff]"
        >
          <X size={16} />
        </button>
      </div>

      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Onboarding progress"
        className="h-1.5 w-full rounded-full bg-[#1e293b] overflow-hidden mb-5"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#13baba] to-[#62ffff] transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="list-none m-0 p-0 flex flex-col gap-2">
        {tasks.map((task) => {
          const isDone: boolean = state.completed.includes(task.id);
          return (
            <li
              key={task.id}
              className="flex items-start gap-3 rounded-lg border border-[#1e293b] p-3 max-md:flex-col max-md:items-stretch"
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={isDone}
                onClick={() => toggleTask(task.id)}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#62ffff] ${
                  isDone
                    ? 'border-[#13baba] bg-[#13baba] text-white'
                    : 'border-[#334155] bg-transparent text-transparent hover:border-[#62ffff]'
                }`}
              >
                <Check size={12} />
                <span className="sr-only">
                  {isDone ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
                </span>
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium m-0 ${isDone ? 'text-[#64748b] line-through' : 'text-white'}`}
                >
                  {task.title}
                </p>
                <p className="text-xs text-[#94a3b8] m-0 mt-0.5">{task.description}</p>
              </div>

              <button
                type="button"
                onClick={() => navigate(task.actionPath)}
                className="inline-flex items-center gap-1 self-center rounded-md border border-[#1e293b] px-3 py-1.5 text-xs font-medium text-[#cbd5e1] cursor-pointer transition-colors hover:border-[#62ffff] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#62ffff] max-md:self-start"
              >
                {task.actionLabel}
                <ChevronRight size={14} />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default OnboardingChecklist;
