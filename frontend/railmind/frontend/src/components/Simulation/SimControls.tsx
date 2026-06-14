'use client';

import React from 'react';
import { CloudRain, Radio, ShieldAlert, AlertOctagon, RotateCcw, Play, Layers } from 'lucide-react';

interface SimControlsProps {
  status: 'IDLE' | 'RUNNING' | 'COMPLETE';
  scenario: string;
  onTrigger: (scenario: string) => void;
  loading: boolean;
}

export default function SimControls({ status, scenario, onTrigger, loading }: SimControlsProps) {
  const scenarios = [
    {
      id: 'flood',
      name: 'Monsoon Flood',
      icon: CloudRain,
      color: 'hover:border-blue-500/50 hover:text-blue-400',
      activeColor: 'border-blue-500 text-blue-400 bg-blue-500/5',
      glow: 'shadow-[0_0_10px_rgba(59,130,246,0.3)]'
    },
    {
      id: 'signal',
      name: 'Signal failure',
      icon: Radio,
      color: 'hover:border-amber-500/50 hover:text-amber-400',
      activeColor: 'border-amber-500 text-amber-400 bg-amber-500/5',
      glow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]'
    },
    {
      id: 'derailment',
      name: 'Weld joint Crack',
      icon: ShieldAlert,
      color: 'hover:border-red-500/50 hover:text-red-400',
      activeColor: 'border-red-500 text-red-400 bg-red-500/5',
      glow: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]'
    },
    {
      id: 'compound',
      name: 'Compound Cascade',
      icon: Layers,
      color: 'hover:border-purple-500/50 hover:text-purple-400',
      activeColor: 'border-purple-500 text-purple-400 bg-purple-500/5',
      glow: 'shadow-[0_0_10px_rgba(168,85,247,0.3)]'
    }
  ];

  return (
    <div className="glass-card p-4 flex flex-col justify-between h-full min-h-[200px]">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Play size={14} className="text-cyan-400" />
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
            Simulation Control Deck
          </h3>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono">STATUS:</span>
          {status === 'IDLE' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-white/5">
              ● IDLE
            </span>
          )}
          {status === 'RUNNING' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
              ● RUNNING
            </span>
          )}
          {status === 'COMPLETE' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ● COMPLETE
            </span>
          )}
        </div>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-2 gap-2 flex-1 items-center">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isActive = scenario === sc.id;
          const isProcessing = loading && isActive;
          
          return (
            <button
              key={sc.id}
              onClick={() => onTrigger(sc.id)}
              disabled={status === 'RUNNING' || loading}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border font-mono text-xs transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 select-none ${
                isActive 
                  ? `${sc.activeColor} ${sc.glow}` 
                  : `border-white/5 bg-slate-900/20 text-slate-400 ${sc.color}`
              }`}
            >
              <Icon size={14} className={isActive ? 'animate-pulse' : ''} />
              <div className="text-left">
                <span className="block font-semibold">{sc.name}</span>
                <span className="text-[8px] text-slate-500 block uppercase">
                  {isActive ? 'Active' : 'Trigger'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Reset Operations */}
      <div className="border-t border-white/5 pt-3 mt-3 flex items-center justify-between">
        <span className="text-[9px] font-mono text-slate-500">
          Swarm event inject simulation.
        </span>
        <button
          onClick={() => onTrigger('none')}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#ff3366]/10 hover:bg-[#ff3366]/20 border border-[#ff3366]/20 hover:border-[#ff3366]/40 text-[#ff3366] text-[10px] font-mono transition-all cursor-pointer"
        >
          <RotateCcw size={10} />
          <span>RESET DECK</span>
        </button>
      </div>
    </div>
  );
}
