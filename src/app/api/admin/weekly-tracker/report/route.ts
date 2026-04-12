import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabaseContext } from '@/lib/admin-auth';
import type { ChecklistItem, WeeklySummary } from '@/types/weekly-tracker';

function getLastWeekStart(): string {
  const now = new Date();
  const day = now.getUTCDay();
  // Get to Monday of current week
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const thisMonday = new Date(now);
  thisMonday.setUTCDate(now.getUTCDate() + mondayOffset);
  // Go back 7 days to last week's Monday
  const lastMonday = new Date(thisMonday);
  lastMonday.setUTCDate(thisMonday.getUTCDate() - 7);
  return lastMonday.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSupabaseContext();
    if ('errorResponse' in admin) return admin.errorResponse;
    const { supabase } = admin;

    const url = new URL(req.url);
    const weekStartDate = url.searchParams.get('weekStartDate') || getLastWeekStart();

    // Validate date format
    const d = new Date(weekStartDate + 'T00:00:00.000Z');
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json(
        { error: 'Invalid weekStartDate format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    // Fetch the summary for this week
    const { data: summary, error: summaryError } = await supabase
      .from('weekly_marketing_summaries')
      .select('*')
      .eq('week_start_date', weekStartDate)
      .maybeSingle();

    if (summaryError) {
      return NextResponse.json(
        { error: `Failed to load summary: ${summaryError.message}` },
        { status: 500 }
      );
    }

    if (!summary) {
      return NextResponse.json(
        { error: `No committed summary found for week starting ${weekStartDate}.` },
        { status: 404 }
      );
    }

    // Fetch all checklist items for this week
    const { data: items, error: itemsError } = await supabase
      .from('weekly_marketing_checklist_items')
      .select('*')
      .eq('week_start_date', weekStartDate)
      .order('day_of_week', { ascending: true })
      .order('platform', { ascending: true })
      .order('task_key', { ascending: true });

    if (itemsError) {
      return NextResponse.json(
        { error: `Failed to load checklist items: ${itemsError.message}` },
        { status: 500 }
      );
    }

    // Compute week end date (Sunday)
    const weekEndDate = new Date(d);
    weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);
    const weekEndStr = weekEndDate.toISOString().slice(0, 10);

    return NextResponse.json({
      summary: summary as WeeklySummary,
      items: (items || []) as ChecklistItem[],
      weekStartDate,
      weekEndDate: weekEndStr,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Unexpected error loading weekly report' },
      { status: 500 }
    );
  }
}
