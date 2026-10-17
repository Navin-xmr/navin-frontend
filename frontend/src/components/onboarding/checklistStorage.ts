export interface ChecklistTask {
  /** Stable id persisted in localStorage */
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  /** Route pushed when the user starts the task */
  actionPath: string;
}

export interface ChecklistState {
  completed: string[];
  dismissed: boolean;
}

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

export function writeChecklistState(state: ChecklistState): void {
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
