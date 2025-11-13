import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabaseContext, SupabaseServerClient } from '@/lib/admin-auth';

type TaskDefinition = {
  key: string;
  label: string;
  platform: string;
  day_of_week: number;
};

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

function parseWeekStart(weekStartDate: string | undefined) {
  if (!weekStartDate) {
    throw new Error('weekStartDate is required');
  }
  const d = new Date(weekStartDate + 'T00:00:00.000Z');
  if (Number.isNaN(d.getTime())) throw new Error('Invalid weekStartDate');
  return d.toISOString().slice(0, 10);
}

async function loadRecentSummaries(supabase: SupabaseServerClient) {
  const { data, error } = await supabase
    .from('weekly_marketing_summaries')
    .select('*')
    .order('week_start_date', { ascending: false })
    .limit(8);

  if (error) {
    throw new Error(`Failed to load weekly summaries: ${error.message}`);
  }
  return data as WeeklySummaryRow[];
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSupabaseContext();
    if ('errorResponse' in admin) return admin.errorResponse;
    const { supabase } = admin;

    const body = await req.json();
    const weekStartDate = parseWeekStart(body.weekStartDate);
    const tasks = (body.tasks || []) as TaskDefinition[];

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: 'tasks array is required to initialize checklist' },
        { status: 400 }
      );
    }

    const { data: existingSummary, error: summaryError } = await supabase
      .from('weekly_marketing_summaries')
      .select('*')
      .eq('week_start_date', weekStartDate)
      .maybeSingle();

    if (summaryError) {
      return NextResponse.json(
        { error: `Failed to load weekly summary: ${summaryError.message}` },
        { status: 500 }
      );
    }

    const isCommitted = !!existingSummary;

    const { data: existingItems, error: itemsError } = await supabase
      .from('weekly_marketing_checklist_items')
      .select('*')
      .eq('week_start_date', weekStartDate);

    if (itemsError) {
      return NextResponse.json(
        { error: `Failed to load weekly items: ${itemsError.message}` },
        { status: 500 }
      );
    }

    const existingByKey = new Map(
      (existingItems || []).map((i: ChecklistItemRow) => [i.task_key, i as ChecklistItemRow])
    );

    const missingInserts: ChecklistItemRow[] = tasks
      .filter((t) => !existingByKey.has(t.key))
      .map((t) => ({
        id: crypto.randomUUID(),
        week_start_date: weekStartDate,
        task_key: t.key,
        task_label: t.label,
        platform: t.platform,
        day_of_week: t.day_of_week,
        completed: false,
      }));

    if (missingInserts.length > 0 && !isCommitted) {
      const { error: insertError } = await supabase
        .from('weekly_marketing_checklist_items' as any)
        .insert(missingInserts as any);

      if (insertError) {
        return NextResponse.json(
          { error: `Failed to initialize checklist: ${insertError.message}` },
          { status: 500 }
        );
      }
    }

    const { data: items, error: reloadError } = await supabase
      .from('weekly_marketing_checklist_items')
      .select('*')
      .eq('week_start_date', weekStartDate)
      .order('day_of_week', { ascending: true })
      .order('task_key', { ascending: true });

    if (reloadError) {
      return NextResponse.json(
        { error: `Failed to reload weekly items: ${reloadError.message}` },
        { status: 500 }
      );
    }

    const recentSummaries = await loadRecentSummaries(supabase);

    return NextResponse.json({
      items,
      currentWeekSummary: existingSummary ?? null,
      recentSummaries,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Unexpected error loading weekly tracker' },
      { status: 500 }
    );
  }
}
