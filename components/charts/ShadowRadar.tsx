'use client';

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { ShadowAttributes } from '@/types';
import { radarData } from '@/lib/shadowEngine';
import { ChartTooltip } from './ChartTooltip';

interface ShadowRadarProps {
  attributes: ShadowAttributes;
  compare?: ShadowAttributes;
  height?: number;
  compareLabel?: string;
  primaryLabel?: string;
}

/**
 * Radar presentation of a Shadow's decision model. When `compare` is supplied
 * the human profile is drawn underneath as a reference silhouette.
 */
export function ShadowRadar({
  attributes,
  compare,
  height = 300,
  compareLabel = 'Human',
  primaryLabel = 'Shadow',
}: ShadowRadarProps) {
  const data = radarData(attributes, compare);

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <defs>
            <linearGradient id="radar-shadow-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4C8DFF" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#9B6BFF" stopOpacity={0.42} />
            </linearGradient>
          </defs>

          <PolarGrid stroke="rgba(120,155,235,0.14)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: 'rgba(190,208,245,0.7)', fontSize: 9, letterSpacing: 1.6 }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />

          <Tooltip
            content={
              <ChartTooltip
                formatter={(value) => `${Math.round(value)}`}
                seriesNames={{ value: primaryLabel, compare: compareLabel }}
              />
            }
          />

          {compare && (
            <Radar
              dataKey="compare"
              stroke="#4C8DFF"
              strokeWidth={1.2}
              strokeDasharray="3 4"
              fill="#4C8DFF"
              fillOpacity={0.08}
              isAnimationActive
              animationDuration={1200}
            />
          )}

          <Radar
            dataKey="value"
            stroke="#9B6BFF"
            strokeWidth={1.8}
            fill="url(#radar-shadow-fill)"
            fillOpacity={0.75}
            isAnimationActive
            animationDuration={1500}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
