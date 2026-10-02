'use client';

import { CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { BattleSeriesPoint } from '@/types';
import { formatDateShort, formatUsd } from '@/lib/format';
import { ChartTooltip } from './ChartTooltip';

interface BattleChartProps {
  data: BattleSeriesPoint[];
  height?: number;
  leftLabel?: string;
  rightLabel?: string;
}

/** Shadow vs Shadow simulation over the selected window. */
export function BattleChart({ data, height = 280, leftLabel = 'Shadow A', rightLabel = 'Shadow B' }: BattleChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -14 }}>
          <CartesianGrid vertical={false} stroke="rgba(120,155,235,0.08)" strokeDasharray="2 6" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'rgba(160,182,225,0.42)', fontSize: 9, letterSpacing: 1 }}
            tickFormatter={(value: string) => formatDateShort(value)}
            axisLine={false}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            tick={{ fill: 'rgba(160,182,225,0.42)', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={(value: number) => formatUsd(value, { compact: true })}
            domain={['dataMin - 40', 'dataMax + 60']}
          />
          <Tooltip
            cursor={{ stroke: 'rgba(140,175,255,0.25)', strokeWidth: 1 }}
            content={
              <ChartTooltip
                labelFormatter={(label) => formatDateShort(String(label))}
                formatter={(value) => formatUsd(value)}
                seriesNames={{ left: leftLabel, right: rightLabel }}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="left"
            stroke="#4C8DFF"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3.5, fill: '#4C8DFF', stroke: '#050914', strokeWidth: 2 }}
            isAnimationActive
            animationDuration={1400}
          />
          <Line
            type="monotone"
            dataKey="right"
            stroke="#9B6BFF"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3.5, fill: '#9B6BFF', stroke: '#050914', strokeWidth: 2 }}
            isAnimationActive
            animationDuration={1600}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
