'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { WorldSeriesPoint } from '@/types';
import { formatUsd } from '@/lib/format';
import { ChartTooltip } from './ChartTooltip';

interface WorldComparisonChartProps {
  data: WorldSeriesPoint[];
  height?: number;
  showAxis?: boolean;
}

/** Humans vs AI Shadows — aggregate notional value across the ECHO world. */
export function WorldComparisonChart({ data, height = 210, showAxis = true }: WorldComparisonChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 6, bottom: 0, left: showAxis ? -14 : -40 }}>
          <defs>
            <linearGradient id="world-human-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4C8DFF" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#4C8DFF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="world-ai-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9B6BFF" stopOpacity={0.34} />
              <stop offset="100%" stopColor="#9B6BFF" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            stroke="rgba(120,155,235,0.09)"
            strokeDasharray="2 6"
          />

          <XAxis
            dataKey="label"
            hide={!showAxis}
            tick={{ fill: 'rgba(160,182,225,0.45)', fontSize: 9, letterSpacing: 1.2 }}
            axisLine={false}
            tickLine={false}
            interval={Math.max(0, Math.floor(data.length / 6) - 1)}
          />
          <YAxis
            hide={!showAxis}
            tick={{ fill: 'rgba(160,182,225,0.45)', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={(value: number) => formatUsd(value, { compact: true })}
            domain={['dataMin - 900000', 'dataMax + 900000']}
          />

          <Tooltip
            cursor={{ stroke: 'rgba(140,175,255,0.28)', strokeWidth: 1 }}
            content={
              <ChartTooltip
                formatter={(value) => formatUsd(value, { compact: true })}
                seriesNames={{ human: 'Humans', ai: 'AI Shadows' }}
              />
            }
          />

          <Area
            type="monotone"
            dataKey="human"
            stroke="none"
            fill="url(#world-human-fill)"
            isAnimationActive
            animationDuration={1400}
          />
          <Area
            type="monotone"
            dataKey="ai"
            stroke="none"
            fill="url(#world-ai-fill)"
            isAnimationActive
            animationDuration={1600}
          />

          <Line
            type="monotone"
            dataKey="human"
            stroke="#4C8DFF"
            strokeWidth={1.6}
            dot={false}
            activeDot={{ r: 3.5, fill: '#4C8DFF', stroke: '#050914', strokeWidth: 2 }}
            isAnimationActive
            animationDuration={1400}
          />
          <Line
            type="monotone"
            dataKey="ai"
            stroke="#9B6BFF"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#9B6BFF', stroke: '#050914', strokeWidth: 2 }}
            isAnimationActive
            animationDuration={1700}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
