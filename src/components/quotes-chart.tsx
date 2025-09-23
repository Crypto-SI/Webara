// src/components/quotes-chart.tsx
'use client';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

type QuotesChartProps = {
  data: {
    status: string;
    count: number;
    fill: string;
  }[];
};

const chartConfig = {
  count: {
    label: 'Count',
  },
} satisfies ChartConfig;

export function QuotesChart({ data }: QuotesChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 10, right: 10 }}
        >
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="status"
            type="category"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            width={80}
          />
          <XAxis dataKey="count" type="number" hide />
          <ChartTooltip
            cursor={{ fill: 'hsl(var(--card))' }}
            content={<ChartTooltipContent />}
          />
          <Bar dataKey="count" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
