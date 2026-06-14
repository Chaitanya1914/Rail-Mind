'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { FeatureImportanceData } from '../../lib/api';

interface FeatureImportanceProps {
  features: FeatureImportanceData[];
}

export default function FeatureImportance({ features }: FeatureImportanceProps) {
  // Sort features descending
  const sortedData = [...features]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111827] border border-white/10 px-2 py-1.5 rounded text-[10px] font-mono shadow-xl text-[#e2e8f0]">
          <span className="font-semibold text-cyan-400">{payload[0].name}:</span>{' '}
          <strong className="text-[#00ff88]">{payload[0].value}%</strong> weight
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-4 h-full flex flex-col justify-between min-h-[200px]">
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
        <BarChart3 size={14} className="text-cyan-400" />
        <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
          XGBoost Delay Risk Indicators
        </h3>
      </div>

      {/* Recharts vertical bar chart */}
      <div className="flex-1 min-h-[140px] w-full text-[10px] font-mono">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={sortedData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              hide={true}
            />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              width={90}
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              barSize={12}
              animationDuration={800}
            >
              {sortedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#barGradient-${index})`}
                />
              ))}
            </Bar>
            
            {/* Gradients definitions */}
            <defs>
              {sortedData.map((_, index) => (
                <linearGradient
                  key={`gradient-${index}`}
                  id={`barGradient-${index}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#00b4ff" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={1} />
                </linearGradient>
              ))}
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Explainer Footer */}
      <div className="text-[9px] font-mono text-slate-500 text-center border-t border-white/5 pt-2 mt-2">
        Features computed dynamically by Swarm Delay ML Inference Engine.
      </div>
    </div>
  );
}
