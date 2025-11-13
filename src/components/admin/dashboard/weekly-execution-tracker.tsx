'use client';

import { useEffect, useMemo, useState } from 'react';
import { format, startOfWeek } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';

type ChecklistItem = {
  id: string;
  week_start_date: string;
  task_key: string;
  task_label: string;
  platform: string;
  day_of_week: number;
  completed: boolean;
};

type WeeklySummary = {
  id: string;
  week_start_date: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  committed_at: string;
};

type ApiState = 'idle' | 'loading' | 'success' | 'error';

type TrackerData = {
  items: ChecklistItem[];
  currentWeekSummary?: WeeklySummary | null;
  recentSummaries: WeeklySummary[];
};

const TASK_DEFINITIONS: {
  key: string;
  label: string;
  platform: string;
  day_of_week: number;
}[] = [
  // Monday
  { key: 'mon_review_leads', label: 'Review lead submissions from last week (quality, source, status)', platform: 'operations', day_of_week: 1 },
  { key: 'mon_check_ctas', label: 'Check all main CTAs and forms are working', platform: 'website', day_of_week: 1 },
  { key: 'mon_review_analytics', label: 'Review previous week analytics (traffic, conversions, key pages)', platform: 'analytics', day_of_week: 1 },

  // Monday – LinkedIn
  { key: 'mon_li_post_educational', label: 'LinkedIn: Publish educational or teardown post', platform: 'linkedin', day_of_week: 1 },
  { key: 'mon_li_engage', label: 'LinkedIn: Engage with comments and DMs (10–15 minutes)', platform: 'linkedin', day_of_week: 1 },
  { key: 'mon_li_connect', label: 'LinkedIn: Connect with 5–10 relevant founders/marketers/agency owners', platform: 'linkedin', day_of_week: 1 },

  // Monday – Instagram
  { key: 'mon_ig_post', label: 'Instagram: Post strong Webara layout or before-and-after', platform: 'instagram', day_of_week: 1 },
  { key: 'mon_ig_story_plan', label: 'Instagram: Story “This week we’re working on...” with link', platform: 'instagram', day_of_week: 1 },

  // Monday – X
  { key: 'mon_x_posts', label: 'X: Publish 1–2 short insight tweets', platform: 'x', day_of_week: 1 },
  { key: 'mon_x_replies', label: 'X: Reply to 3–5 relevant tweets with meaningful input', platform: 'x', day_of_week: 1 },

  // Monday – YouTube
  { key: 'mon_yt_topic', label: 'YouTube: Choose topic and outline this week’s main video', platform: 'youtube', day_of_week: 1 },
  { key: 'mon_yt_assets', label: 'YouTube: Confirm recording slot and required assets', platform: 'youtube', day_of_week: 1 },

  // Monday – Ads
  { key: 'mon_ads_check', label: 'Ads: Run quick performance check (CPC, CTR, conversions)', platform: 'ads', day_of_week: 1 },
  { key: 'mon_ads_pause', label: 'Ads: Pause obvious underperformers if needed', platform: 'ads', day_of_week: 1 },

  // Tuesday – LinkedIn
  { key: 'tue_li_case_study', label: 'LinkedIn: Post mini case study or results-driven narrative', platform: 'linkedin', day_of_week: 2 },
  { key: 'tue_li_dms', label: 'LinkedIn: Respond to DMs and comments', platform: 'linkedin', day_of_week: 2 },
  { key: 'tue_li_conversations', label: 'LinkedIn: Start 2–3 new conversations via insightful comments', platform: 'linkedin', day_of_week: 2 },

  // Tuesday – Instagram
  { key: 'tue_ig_story', label: 'Instagram: Story with WIP snippet / UI detail / quick tip', platform: 'instagram', day_of_week: 2 },

  // Tuesday – X
  { key: 'tue_x_posts', label: 'X: 1–2 tweets with micro-lessons or strong opinions', platform: 'x', day_of_week: 2 },

  // Tuesday – YouTube
  { key: 'tue_yt_outline', label: 'YouTube: Finalize script/outline and screens for this week’s video', platform: 'youtube', day_of_week: 2 },

  // Tuesday – Ads
  { key: 'tue_ads_ideas', label: 'Ads: Capture creative ideas from best-performing organic content', platform: 'ads', day_of_week: 2 },

  // Wednesday – LinkedIn
  { key: 'wed_li_process', label: 'LinkedIn: Process / behind-the-scenes breakdown', platform: 'linkedin', day_of_week: 3 },
  { key: 'wed_li_engage', label: 'LinkedIn: Engage with users who liked or commented', platform: 'linkedin', day_of_week: 3 },

  // Wednesday – Instagram
  { key: 'wed_ig_post', label: 'Instagram: Carousel or reel (process, outcomes, explainer)', platform: 'instagram', day_of_week: 3 },
  { key: 'wed_ig_story', label: 'Instagram: Story with poll or question on website/conversion challenges', platform: 'instagram', day_of_week: 3 },

  // Wednesday – X
  { key: 'wed_x_posts', label: 'X: 1–2 tweets', platform: 'x', day_of_week: 3 },
  { key: 'wed_x_thread', label: 'X: Optional short thread (3–5 tweets) on core topic', platform: 'x', day_of_week: 3 },

  // Wednesday – YouTube
  { key: 'wed_yt_record', label: 'YouTube: Record main weekly video', platform: 'youtube', day_of_week: 3 },

  // Wednesday – Ads
  { key: 'wed_ads_pacing', label: 'Ads: Confirm spend pacing; adjust only if significantly off', platform: 'ads', day_of_week: 3 },

  // Thursday – LinkedIn
  { key: 'thu_li_founder', label: 'LinkedIn: Optional founder POV / strategic insight / opinion post', platform: 'linkedin', day_of_week: 4 },
  { key: 'thu_li_followup', label: 'LinkedIn: Follow up with warm leads or replies', platform: 'linkedin', day_of_week: 4 },

  // Thursday – Instagram
  { key: 'thu_ig_story', label: 'Instagram: Story highlighting YouTube clip / client win / testimonial', platform: 'instagram', day_of_week: 4 },

  // Thursday – X
  { key: 'thu_x_insight', label: 'X: 1–2 tweets with insights, metrics, or screenshots', platform: 'x', day_of_week: 4 },

  // Thursday – YouTube
  { key: 'thu_yt_edit', label: 'YouTube: Edit video, add CTA, optimize metadata', platform: 'youtube', day_of_week: 4 },
  { key: 'thu_yt_clips', label: 'YouTube: Create 2–4 short clips for Shorts/Reels', platform: 'youtube', day_of_week: 4 },

  // Thursday – Ads
  { key: 'thu_ads_creative', label: 'Ads: Draft 1 new creative or variation to test next week', platform: 'ads', day_of_week: 4 },

  // Friday – LinkedIn
  { key: 'fri_li_recap', label: 'LinkedIn: Weekly recap / key lesson / transformation story with CTA', platform: 'linkedin', day_of_week: 5 },
  { key: 'fri_li_dms', label: 'LinkedIn: Engage with comments; DM 2–3 warm prospects (value first)', platform: 'linkedin', day_of_week: 5 },

  // Friday – Instagram
  { key: 'fri_ig_case_study', label: 'Instagram: Case study/testimonial/standout UI example', platform: 'instagram', day_of_week: 5 },
  { key: 'fri_ig_story_brand', label: 'Instagram: Stories showing human/brand personality', platform: 'instagram', day_of_week: 5 },

  // Friday – X
  { key: 'fri_x_teaser', label: 'X: 1–2 tweets (recap, insight, teaser for next content)', platform: 'x', day_of_week: 5 },

  // Friday – YouTube
  { key: 'fri_yt_publish', label: 'YouTube: Publish main video & Shorts, configure CTAs', platform: 'youtube', day_of_week: 5 },
  { key: 'fri_yt_distribution', label: 'YouTube: Share video on LinkedIn, X, IG Stories', platform: 'youtube', day_of_week: 5 },

  // Friday – Ads (Weekly Optimization)
  { key: 'fri_ads_review', label: 'Ads: Review CTR, CPL, conversions, lead quality', platform: 'ads', day_of_week: 5 },
  { key: 'fri_ads_pause', label: 'Ads: Pause worst performers', platform: 'ads', day_of_week: 5 },
  { key: 'fri_ads_reallocate', label: 'Ads: Reallocate budget to top performers', platform: 'ads', day_of_week: 5 },
  { key: 'fri_ads_plan', label: 'Ads: Decide next week’s focus and experiments', platform: 'ads', day_of_week: 5 },

  // Saturday (optional / light)
  { key: 'sat_ig_story', label: 'Instagram: Optional BTS / culture / casual Story', platform: 'instagram', day_of_week: 6 },
  { key: 'sat_x_post', label: 'X: Optional founder-style reflection or evergreen insight', platform: 'x', day_of_week: 6 },
  { key: 'sat_yt_comments', label: 'YouTube: Reply to new comments', platform: 'youtube', day_of_week: 6 },

  // Sunday (Review & Planning)
  { key: 'sun_review_leads', label: 'Review total leads and opportunities', platform: 'analytics', day_of_week: 7 },
  { key: 'sun_review_conversions', label: 'Review conversion rate on key forms', platform: 'analytics', day_of_week: 7 },
  { key: 'sun_review_top_content', label: 'Identify top-performing posts, videos, and ads', platform: 'analytics', day_of_week: 7 },
  { key: 'sun_define_theme', label: 'Define next week’s primary content theme', platform: 'planning', day_of_week: 7 },
  { key: 'sun_define_offer', label: 'Define next week’s main offer / CTA', platform: 'planning', day_of_week: 7 },
  { key: 'sun_define_yt', label: 'Define next week’s YouTube topic(s)', platform: 'planning', day_of_week: 7 },
  { key: 'sun_outline_li', label: 'Outline next week’s LinkedIn posts & talking points', platform: 'planning', day_of_week: 7 },
  { key: 'sun_capture_ideas', label: 'Capture ideas for new landing pages / experiments / offers', platform: 'planning', day_of_week: 7 },
];

// Utilities

function getCurrentWeekStartISO() {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  return format(start, 'yyyy-MM-dd');
}

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

function groupByDay(items: ChecklistItem[]) {
  const groups: Record<number, ChecklistItem[]> = {};
  for (const item of items) {
    if (!groups[item.day_of_week]) groups[item.day_of_week] = [];
    groups[item.day_of_week].push(item);
  }
  Object.values(groups).forEach(list =>
    list.sort((a, b) =>
      a.platform.localeCompare(b.platform) || a.task_key.localeCompare(b.task_key)
    )
  );
  return groups;
}

// Component

export function WeeklyExecutionTracker() {
  const [data, setData] = useState<TrackerData | null>(null);
  const [loadingState, setLoadingState] = useState<ApiState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [localCompletion, setLocalCompletion] = useState<Record<string, boolean>>({});
  const [storageHydrated, setStorageHydrated] = useState(false);
  const [committing, setCommitting] = useState(false);

  const weekStart = useMemo(() => getCurrentWeekStartISO(), []);
  const storageKey = useMemo(() => `weekly-execution-tracker:${weekStart}`, [weekStart]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      setLocalCompletion(raw ? (JSON.parse(raw) as Record<string, boolean>) : {});
    } catch {
      setLocalCompletion({});
    } finally {
      setStorageHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageHydrated || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(localCompletion));
    } catch (e) {
      console.error('Failed to persist weekly tracker progress', e);
    }
  }, [localCompletion, storageHydrated, storageKey]);

  const resolvedItems = useMemo(() => {
    if (!data) return [] as ChecklistItem[];
    return data.items.map(item => {
      const override = localCompletion[item.task_key];
      return override === undefined ? item : { ...item, completed: override };
    });
  }, [data, localCompletion]);

  const grouped = useMemo(
    () => groupByDay(resolvedItems),
    [resolvedItems]
  );

  const isCommitted = !!data?.currentWeekSummary;

  // Fetch or initialize current week checklist
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingState('loading');
        setError(null);
        const res = await fetch('/api/admin/weekly-tracker/current', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weekStartDate: weekStart,
            tasks: TASK_DEFINITIONS
          })
        });
        if (!res.ok) {
          throw new Error(`Failed to load weekly tracker (${res.status})`);
        }
        const json = (await res.json()) as TrackerData;
        setData(json);
        setLoadingState('success');
      } catch (e: any) {
        setError(e.message ?? 'Failed to load weekly tracker.');
        setLoadingState('error');
      }
    };
    void load();
  }, [weekStart]);

  const handleToggle = (item: ChecklistItem, nextCompleted: boolean) => {
    if (isCommitted || item.completed === nextCompleted) return;
    setLocalCompletion(prev => ({ ...prev, [item.task_key]: nextCompleted }));
  };

  const handleCommitWeek = async () => {
    if (isCommitted) return;
    setCommitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/weekly-tracker/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStartDate: weekStart,
          tasks: resolvedItems.map(item => ({
            id: item.id,
            task_key: item.task_key,
            task_label: item.task_label,
            platform: item.platform,
            day_of_week: item.day_of_week,
            completed: item.completed,
          }))
        })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to commit week.');
      }
      const summary = (await res.json()) as WeeklySummary;
      setData(prev =>
        prev
          ? {
              ...prev,
              items: resolvedItems,
              currentWeekSummary: summary,
              recentSummaries: [summary, ...(prev.recentSummaries || [])]
            }
          : prev
      );
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(storageKey);
      }
      setLocalCompletion({});
    } catch (e: any) {
      setError(e.message ?? 'Error committing week.');
    } finally {
      setCommitting(false);
    }
  };

  const completion = useMemo(() => {
    if (resolvedItems.length === 0) return { completed: 0, total: 0 };
    const completed = resolvedItems.filter(i => i.completed).length;
    return { completed, total: resolvedItems.length };
  }, [resolvedItems]);

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">
            Week starting {weekStart}
          </p>
          <p className="text-xs text-muted-foreground">
            {completion.total > 0
              ? `${completion.completed} / ${completion.total} tasks completed`
              : 'Loading tasks for this week...'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button
            size="sm"
            variant={isCommitted ? 'outline' : 'default'}
            disabled={
              isCommitted ||
              committing ||
              loadingState !== 'success' ||
              !data ||
              data.items.length === 0
            }
            onClick={handleCommitWeek}
          >
            {isCommitted
              ? 'Week Committed'
              : committing
              ? 'Committing...'
              : 'Commit Week Summary'}
          </Button>
          {isCommitted && data?.currentWeekSummary && (
            <span className="text-[10px] text-muted-foreground">
              Committed at {data.currentWeekSummary.committed_at}
            </span>
          )}
        </div>
      </div>

      {loadingState === 'loading' && (
        <p className="text-xs text-muted-foreground">Loading weekly tracker...</p>
      )}

      {loadingState === 'success' && data && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {DAY_LABELS.map((label, idx) => {
            const dayNumber = idx + 1;
            const items = grouped[dayNumber] ?? [];
            if (items.length === 0) return null;
            return (
              <Card key={label} className="border-muted/60">
                <CardContent className="pt-4 space-y-3">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">
                    {label}
                  </div>
                  {items.map(item => (
                    <label
                      key={item.id}
                      className="flex items-start gap-2 text-xs text-foreground leading-tight"
                    >
                      <Checkbox
                        checked={item.completed}
                        disabled={isCommitted}
                        onCheckedChange={(checked) =>
                          handleToggle(item, checked === true)
                        }
                      />
                      <div>
                        <span className="font-medium capitalize text-[10px] text-muted-foreground">
                          {item.platform}
                        </span>
                        <div>{item.task_label}</div>
                      </div>
                    </label>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {loadingState === 'success' && data && data.recentSummaries && data.recentSummaries.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">
            Recent weeks
          </p>
          <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
            {data.recentSummaries.map((s) => (
              <span
                key={s.id}
                className="rounded border px-2 py-1"
              >
                {s.week_start_date}: {s.completed_tasks}/{s.total_tasks} (
                {s.completion_rate}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
