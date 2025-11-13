import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabaseContext } from '@/lib/admin-auth';

type ChecklistItemRow = {
  id: string;
  week_start_date: string;
  task_key: string;
  task_label: string;
  platform: string;
  day_of_week: number;
  completed: boolean;
};

type WeeklySummaryRow = {
  id: string;
  week_start_date: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  breakdown_json: any;
  committed_at: string;
  committed_by: string | null;
  is_committed: boolean;
};

type ClientTaskPayload = {
  id: string;
  task_key: string;
  task_label: string;
  platform: string;
  day_of_week: number;
  completed: boolean;
};

function parseWeekStart(weekStartDate: string | undefined) {
  if (!weekStartDate) {
    throw new Error('weekStartDate is required');
  }
  const d = new Date(weekStartDate + 'T00:00:00.000Z');
  if (Number.isNaN(d.getTime())) throw new Error('Invalid weekStartDate');
  return d.toISOString().slice(0, 10);
}

// Determine if now (UTC) is at/after Sunday 21:00 UK (UTC in this environment) for the given week.
function isAfterCutoffForWeek(weekStartDate: string, nowUtc: Date): boolean {
  const weekStart = new Date(weekStartDate + 'T00:00:00.000Z');
  if (Number.isNaN(weekStart.getTime())) return false;

  // Sunday is weekStart + 6 days.
  const cutoff = new Date(weekStart);
  cutoff.setUTCDate(cutoff.getUTCDate() + 6);
  cutoff.setUTCHours(21, 0, 0, 0);

  return nowUtc.getTime() >= cutoff.getTime();
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSupabaseContext();
    if ('errorResponse' in admin) return admin.errorResponse;
    const { supabase, userId } = admin;

    const body = await req.json();
    const weekStartDate = parseWeekStart(body.weekStartDate);
    const clientTasks = Array.isArray(body.tasks) ? (body.tasks as ClientTaskPayload[]) : [];

    // Block if already committed
    const { data: existing, error: existingError } = await supabase
      .from('weekly_marketing_summaries')
      .select('*')
      .eq('week_start_date', weekStartDate)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: `Failed to check existing summary: ${existingError.message}` },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: 'Week already committed.' },
        { status: 409 }
      );
    }

    // Enforce Sunday 21:00 UK cutoff (UK == UTC in this environment; adjust if DST later)
    const nowUtc = new Date();
    if (!isAfterCutoffForWeek(weekStartDate, nowUtc)) {
      return NextResponse.json(
        {
          error:
            'Commit not allowed yet. You can only commit after Sunday 21:00 UK time for the selected week.',
        },
        { status: 403 }
      );
    }

    let typedItems: ChecklistItemRow[];
    if (clientTasks.length > 0) {
      const invalid = clientTasks.some(
        (t) =>
          !t ||
          typeof t.id !== 'string' ||
          typeof t.task_key !== 'string' ||
          typeof t.task_label !== 'string' ||
          typeof t.platform !== 'string' ||
          typeof t.day_of_week !== 'number' ||
          typeof t.completed !== 'boolean'
      );
      if (invalid) {
        return NextResponse.json(
          { error: 'Invalid tasks payload.' },
          { status: 400 }
        );
      }

      const upsertPayload = clientTasks.map((task) => ({
        id: task.id,
        week_start_date: weekStartDate,
        task_key: task.task_key,
        task_label: task.task_label,
        platform: task.platform,
        day_of_week: task.day_of_week,
        completed: task.completed,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      }));

      const { error: upsertError } = await (supabase as any)
        .from('weekly_marketing_checklist_items')
        .upsert(upsertPayload, { onConflict: 'id' });

      if (upsertError) {
        return NextResponse.json(
          { error: `Failed to persist checklist state: ${upsertError.message}` },
          { status: 500 }
        );
      }

      typedItems = upsertPayload as ChecklistItemRow[];
    } else {
      // Load checklist items for aggregation
      const { data: items, error: itemsError } = await supabase
        .from('weekly_marketing_checklist_items')
        .select('*')
        .eq('week_start_date', weekStartDate);

      if (itemsError) {
        return NextResponse.json(
          { error: `Failed to load checklist items: ${itemsError.message}` },
          { status: 500 }
        );
      }

      if (!items || items.length === 0) {
        return NextResponse.json(
          { error: 'No checklist items found for this week to commit.' },
          { status: 400 }
        );
      }

      typedItems = items as ChecklistItemRow[];
    }
    const totalTasks = typedItems.length;
    const completedTasks = typedItems.filter((i) => i.completed).length;
    const completionRate =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Build breakdown JSON
    const breakdown: {
      by_platform: Record<string, { total: number; completed: number; completion_rate: number }>;
      by_day: Record<string, { total: number; completed: number; completion_rate: number }>;
    } = {
      by_platform: {},
      by_day: {},
    };

    for (const item of typedItems) {
      const p = item.platform;
      const d = String(item.day_of_week);

      if (!breakdown.by_platform[p]) {
        breakdown.by_platform[p] = { total: 0, completed: 0, completion_rate: 0 };
      }
      breakdown.by_platform[p].total += 1;
      if (item.completed) breakdown.by_platform[p].completed += 1;

      if (!breakdown.by_day[d]) {
        breakdown.by_day[d] = { total: 0, completed: 0, completion_rate: 0 };
      }
      breakdown.by_day[d].total += 1;
      if (item.completed) breakdown.by_day[d].completed += 1;
    }

    for (const v of Object.values(breakdown.by_platform)) {
      v.completion_rate = v.total ? Math.round((v.completed / v.total) * 100) : 0;
    }
    for (const v of Object.values(breakdown.by_day)) {
      v.completion_rate = v.total ? Math.round((v.completed / v.total) * 100) : 0;
    }

    const insertPayload: Omit<WeeklySummaryRow, 'id' | 'committed_at'> = {
      week_start_date: weekStartDate,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      completion_rate: completionRate,
      breakdown_json: breakdown,
      committed_by: userId,
      is_committed: true,
    };

    // Use any-cast on supabase for this new table to avoid Database type drift.
    const { data: inserted, error: insertError } = await (supabase as any)
      .from('weekly_marketing_summaries')
      .insert(insertPayload)
      .select('*')
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to commit weekly summary: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(inserted as WeeklySummaryRow);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Unexpected error committing weekly summary' },
      { status: 500 }
    );
  }
}
