export const STATUSES = [
  { value: 'todo', label: 'To Do', color: 'default' },
  { value: 'in_progress', label: 'In Progress', color: '#8B7355' },
  { value: 'waiting', label: 'Waiting', color: '#D4A06A' },
  { value: 'awaiting_approval', label: 'Awaiting Approval', color: '#C4916B' },
  { value: 'done', label: 'Done', color: '#7A9B6D' },
];

export const PRIORITIES = [
  { value: 'urgent', label: 'Urgent', color: '#C46B5A' },
  { value: 'high', label: 'High', color: '#D4A06A' },
  { value: 'medium', label: 'Medium', color: '#8B7355' },
  { value: 'low', label: 'Low', color: '#7A9B6D' },
];

export const CATEGORIES = [
  'general',
  'meetings',
  'finance',
  'travel',
  'hr',
  'marketing',
  'operations',
  'legal',
  'personal',
];

export const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function getStatusConfig(status) {
  return STATUSES.find((s) => s.value === status) || STATUSES[0];
}

export function getPriorityConfig(priority) {
  return PRIORITIES.find((p) => p.value === priority) || PRIORITIES[2];
}
