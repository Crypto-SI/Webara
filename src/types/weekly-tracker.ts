/**
 * Shared types for the Weekly Marketing Execution Tracker.
 *
 * Used by:
 * - src/components/admin/dashboard/weekly-execution-tracker.tsx
 * - src/app/api/admin/weekly-tracker/report/route.ts
 * - src/lib/pdf/weekly-report.ts
 */

export type ChecklistItem = {
  id: string;
  week_start_date: string;
  task_key: string;
  task_label: string;
  platform: string;
  day_of_week: number;
  completed: boolean;
  updated_at?: string;
  updated_by?: string | null;
};

export type PlatformBreakdownEntry = {
  total: number;
  completed: number;
  completion_rate: number;
};

export type DayBreakdownEntry = {
  total: number;
  completed: number;
  completion_rate: number;
};

export type BreakdownJson = {
  by_platform: Record<string, PlatformBreakdownEntry>;
  by_day: Record<string, DayBreakdownEntry>;
};

export type WeeklySummary = {
  id: string;
  week_start_date: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  breakdown_json?: BreakdownJson | null;
  committed_at: string;
  committed_by?: string | null;
};

export type ReportData = {
  summary: WeeklySummary;
  items: ChecklistItem[];
  weekStartDate: string;
  weekEndDate: string;
};
