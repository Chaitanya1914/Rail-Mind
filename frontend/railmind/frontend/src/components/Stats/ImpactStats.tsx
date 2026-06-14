'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Train, ShieldCheck, AlertOctagon, Zap, Users, AlertCircle, WifiOff } from 'lucide-react';
import { ImpactStatsData } from '../../lib/api';

interface ImpactStatsProps {
  stats: ImpactStatsData;
  backendOnline: boolean;
}

export default function ImpactStats({ stats, backendOnline }: ImpactStatsProps) {
  // Config for various metrics
  const items = [
    {
      label: 'TRAINS ACTIVE',
      value: stats.trainsMonitored,
      icon: Train,
      color: 'text-cyan-400',
      glow: 'shadow-[0_0_10px_rgba(6,182,212,0.2)]'
    },
    {
      label: 'DELAYS PREVENTED',
      value: stats.delaysPrevented,
      icon: Zap,
      color: 'text-emerald-400',
      glow: 'shadow-[0_0_10px_rgba(16,185,129,0.2)]'
    },
    {
      label: 'ACTIVE ANOMALIES',
      value: stats.activeAnomalies,
      icon: AlertOctagon,
      color: stats.activeAnomalies > 0 ? 'text-[#ff3366]' : 'text-slate-400',
      glow: stats.activeAnomalies > 0 ? 'shadow-[0_0_10px_rgba(255,51,102,0.2)]' : ''
    },
    {
      label: 'PASSENGERS SHIELDED',
      value: `~${stats.passengersAffected.toLocaleString()}`,
      icon: Users,
      color: 'text-blue-400',
      glow: 'shadow-[0_0_10px_rgba(0,180,255,0.2)]'
    },
    {
      label: 'DECISION RESPONSE',
      value: stats.avgResponseTime,
      icon: CpuIcon, // We'll build a helper or use Lucide's icon
      color: 'text-amber-400',
      glow: 'shadow-[0_0_10px_rgba(245,158,11,0.2)]'
    },
    {
      label: 'SAFETY INDEX',
      value: `${stats.safetyScore}%`,
      icon: ShieldCheck,
      color: stats.safetyScore > 90 ? 'text-emerald-400' : stats.safetyScore > 75 ? 'text-amber-400' : 'text-[#ff3366]',
      glow: stats.safetyScore > 90 ? 'shadow-[0_0_10px_rgba(16,185,129,0.2)]' : ''
    }
  ];

  function CpuIcon({ className }: { className?: string }) {
    return (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="16" height="16" x="4" y="4" rx="2" />
        <rect width="6" height="6" x="9" y="9" rx="1" />
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
      </svg>
    );
  }

  return (
    <div className="w-full bg-[#111827]/80 backdrop-blur-md border-b border-white/5 px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Brand Logo Header */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <span className="absolute inline-flex h-4 w-4 rounded-full bg-cyan-400/20 animate-ping"></span>
          <span className="text-xl">🚂</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-wider text-slate-100 font-sans flex items-center gap-1.5">
            RAIL<span className="text-cyan-400">MIND</span>
            <span className="text-[9px] font-mono text-slate-500 font-normal border border-white/5 px-1 rounded bg-slate-950">
              v1.0
            </span>
          </span>
          <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">SWARM OPERATIONS DECK</span>
        </div>
      </div>

      {/* Stats Columns */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 lg:gap-8">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-950/40 border border-white/5 shadow-inner"
            >
              <div className={`p-1 rounded-md bg-slate-900 border border-white/5 ${item.color} ${item.glow}`}>
                <Icon size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-slate-500 font-mono tracking-wider">{item.label}</span>
                <motion.span
                  key={item.value.toString()}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs font-mono font-bold ${item.color}`}
                >
                  {item.value}
                </motion.span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Backend Status indicator */}
      <div className="flex items-center gap-2">
        {!backendOnline ? (
          <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 border border-amber-400/25 px-2.5 py-1 rounded-full text-[10px] font-mono animate-pulse">
            <WifiOff size={12} />
            <span>BACKEND OFFLINE (SIMULATOR FALLBACK ACTIVE)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 border border-emerald-400/25 px-2.5 py-1 rounded-full text-[10px] font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span>SWARM CLOUD ONLINE</span>
          </div>
        )}
      </div>
    </div>
  );
}
