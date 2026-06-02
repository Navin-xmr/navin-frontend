export type MilestoneStatus = 'Created' | 'In Transit' | 'At Checkpoint' | 'Delivered';

export interface Milestone {
  id: string;
  status: MilestoneStatus;
  label: string;
  timestamp: string;
  location?: string;
  isCompleted: boolean;
  isCurrent?: boolean;
}

export interface MilestoneTimelineProps {
  milestones: Milestone[];
}
