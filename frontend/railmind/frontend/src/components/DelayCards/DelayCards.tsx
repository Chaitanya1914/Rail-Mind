'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Navigation, AlertTriangle } from 'lucide-react';
import { DelayCardData } from '../../lib/api';

interface DelayCardsProps {
  delays: DelayCardData[];
}

export default function DelayCards({ delays }: DelayCardsProps) {
  const getRiskColor = (risk: number) => {
    if (risk < 50) return 'text-[#00ff88]';
    if (risk < 75) return 'text-[#ffd700]';
    return 'text-[#ff3366] font-bold';
  };

  const getBarColor = (risk: number) => {
    if (risk < 50) return 'bg-[#00ff88]';
    if (risk < 75) return 'bg-[#ffd700]';
    return 'bg-[#ff3366] glow-red';
  };

  return (
    <div className="glass-card p-4 h-full flex flex-col justify-between min-h-[200px]">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-cyan-400" />
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
            Active Delay Risk Index
          </h3>
        </div>
        <span className="text-[9px] font-mono bg-slate-800 text-slate-400 border border-white/5 px-2 py-0.5 rounded">
          {delays.length} MONITORING
        </span>
      </div>

      {/* Cards Scroll */}
      <div className="flex-1 grid grid-cols-3 gap-3 items-center">
        {delays.map((train) => {
          const riskColor = getRiskColor(train.risk);
          const barColor = getBarColor(train.risk);
          const isHighRisk = train.risk >= 75;

          return (
            <motion.div
              key={train.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className={`p-3 rounded-lg bg-slate-950/40 border transition-all duration-300 flex flex-col justify-between h-full min-h-[120px] ${
                isHighRisk 
                  ? 'border-red-500/20 hover:border-red-500/40 glow-red' 
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono font-bold tracking-wide">
                    #{train.trainNo}
                  </span>
                  <Navigation size={10} className="text-slate-500" />
                </div>
                <h4 className="text-xs font-bold text-slate-200 line-clamp-1">
                  {train.trainName}
                </h4>
              </div>

              {/* Progress gauge */}
              <div className="space-y-1.5 my-2">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-slate-500">DELAY RISK:</span>
                  <span className={riskColor}>{train.risk}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${train.risk}%` }}
                  ></div>
                </div>
              </div>

              {/* Expected delay minutes */}
              <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-white/5">
                <span className="text-slate-500">DELAY EST:</span>
                <span className={`flex items-center gap-1 font-bold ${riskColor}`}>
                  {isHighRisk && <AlertTriangle size={9} />}
                  {train.delayMins > 0 ? `~${train.delayMins} min` : 'ON TIME'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
