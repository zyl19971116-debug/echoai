'use client';

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PortfolioPoint } from '@/types';
import { formatDateShort, formatUsd } from '@/lib/format';
import { ChartTooltip } from './ChartTooltip';

interface PortfolioChartProps {
  data: PortfolioPoint[];
  height?: number;
  compact?: boolean;
  showAxis?: boolean;
  humanLabel?: string;
  aiLabel?: string;
}

/**
 * The core visual of the product: the human curve against the Shadow curve.
 * Both start from the same notional balance, so the widening gap *is* the
 * story of the page.
 */
export function PortfolioChart({
  data,
  height = 300,
  compact = false,
  showAxis = true,
  humanLabel = 'You',
  aiLabel = 'AI Shadow',
}: PortfolioChartProps) {
  const gradientId = compact ? 'pf-compact' : 'pf-full';

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: showAxis ? -12 : -42 }}>
          <defs>
            <linearGradient id={`${gradientId}-ai`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9B6BFF" stopOpacity={0.32} />
              <stop offset="70%" stopColor="#9B6BFF" stopOpacity={0.04} />
              <stop offset="100%" stopColor="#9B6BFF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`${gradientId}-human`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4C8DFF" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#4C8DFF" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="rgba(120,155,235,0.08)" strokeDasharray="2 6" />

          <XAxis
            dataKey="date"
            hide={!showAxis}
            tick={{ fill: 'rgba(160,182,225,0.42)', fontSize: 9, letterSpacing: 1 }}
            tickFormatter={(value: string) => formatDateShort(value)}
            axisLine={false}
            tickLine={false}
            minTickGap={38}
          />
          <YAxis
            hide={!showAxis}
            tick={{ fill: 'rgba(160,182,225,0.42)', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            width={compact ? 46 : 54}
            tickFormatter={(value: number) => formatUsd(value, { compact: true })}
            domain={['dataMin - 60', 'dataMax + 90']}
          />

          <Tooltip
            cursor={{ stroke: 'rgba(140,175,255,0.25)', strokeWidth: 1 }}
            content={
              <ChartTooltip
                labelFormatter={(label) => formatDateShort(String(label))}
                formatter={(value) => formatUsd(value)}
                seriesNames={{ human: humanLabel, ai: aiLabel }}
              />
            }
          />

          <Area
            type="monotone"
            dataKey="ai"
            stroke="none"
            fill={`url(#${gradientId}-ai)`}
            isAnimationActive
            animationDuration={1500}
          />
          <Area
            type="monotone"
            dataKey="human"
            stroke="none"
            fill={`url(#${gradientId}-human)`}
            isAnimationActive
            animationDuration={1300}
          />

          <Line
            type="monotone"
            dataKey="human"
            stroke="#4C8DFF"
            strokeWidth={1.8}
            dot={false}
            activeDot={{ r: 3.5, fill: '#4C8DFF', stroke: '#050914', strokeWidth: 2 }}
            isAnimationActive
            animationDuration={1300}
          />
          <Line
            type="monotone"
            dataKey="ai"
            stroke="#9B6BFF"
            strokeWidth={2.2}
            dot={false}
            activeDot={{ r: 4, fill: '#9B6BFF', stroke: '#050914', strokeWidth: 2 }}
            isAnimationActive
            animationDuration={1600}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
