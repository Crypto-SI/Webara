import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabaseContext } from '@/lib/admin-auth';

type ChecklistItemRow = {
  id: string;
  week_start_date: string;
  completed: boolean;
};

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminSupabaseContext();
    if ('errorResponse' in admin) return admin.errorResponse;
    const { supabase, userId } = admin;

    const body = await req.json();
    const { id, completed } = body as { id?: string; completed?: boolean };

    if (!id || typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'id and completed(boolean) are required' },
        { status: 400 }
      );
    }

    const { data: item, error: itemError } = await supabase
      .from('weekly_marketing_checklist_items')
      .select('id, week_start_date')
      .eq('id', id)
      .maybeSingle();

    if (itemError || !item) {
      return NextResponse.json({ error: 'Checklist item not found' }, { status: 404 });
    }

    const weekStartDate = (item as ChecklistItemRow).week_start_date;

    const { data: summary, error: summaryError } = await supabase
      .from('weekly_marketing_summaries')
      .select('id')
      .eq('week_start_date', weekStartDate)
      .maybeSingle();

    if (summaryError) {
      return NextResponse.json(
        { error: `Failed to verify week summary: ${summaryError.message}` },
        { status: 500 }
      );
    }

    if (summary) {
      return NextResponse.json(
        { error: 'This week has been committed and is locked from further edits.' },
        { status: 409 }
      );
    }

    // Use an explicit, structurally typed payload to satisfy TS without `never`
    const updatePayload: {
      completed: boolean;
      updated_at: string;
      updated_by: string;
    } = {
      completed,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    };

    // Use untyped table cast to avoid Database generics complaining about this new table.
    const { error: updateError } = await (supabase as any)
      .from('weekly_marketing_checklist_items')
      .update(updatePayload)
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update checklist item: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Unexpected error updating item' },
      { status: 500 }
    );
  }
}
