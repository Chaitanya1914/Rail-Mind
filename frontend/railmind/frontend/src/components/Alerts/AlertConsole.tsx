'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertOctagon, AlertTriangle, Info } from 'lucide-react';
import { CommsLogItem } from '../../lib/api';

interface AlertConsoleProps {
  log: CommsLogItem[];
}

export default function AlertConsole({ log }: AlertConsoleProps) {
  // Filter messages belonging to the passenger broadcast/portal
  const alerts = log.filter(
    (item) =>
      item.to.toLowerCase().includes('broadcast') ||
      item.to.toLowerCase().includes('portal') ||
      item.from.toLowerCase().includes('comms')
  ).reverse(); // Show newest at the top

  const getAlertSeverity = (message: string) => {
    if (message.includes('🔴') || message.toLowerCase().includes('critical') || message.toLowerCase().includes('emergency')) {
      return { label: 'CRITICAL', color: 'text-[#ff3366] bg-[#ff3366]/10 border-[#ff3366]/25', icon: AlertOctagon };
    }
    if (message.includes('🟡') || message.toLowerCase().includes('warning') || message.toLowerCase().includes('caution')) {
      return { label: 'WARNING', color: 'text-[#ffd700] bg-[#ffd700]/10 border-[#ffd700]/25', icon: AlertTriangle };
    }
    return { label: 'ADVISORY', color: 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/25', icon: Info };
  };

  return (
    <div className="glass-card p-4 h-full flex flex-col justify-between min-h-[220px]">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-cyan-400 animate-pulse" />
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
            Passenger Alert Dispatch
          </h3>
        </div>
        <span className="text-[9px] font-mono bg-slate-800 text-slate-400 border border-white/5 px-2 py-0.5 rounded">
          {alerts.length} BROADCASTS
        </span>
      </div>

      {/* Broadcast Feed */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[160px] pr-1">
        {alerts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono py-8">
            No public bulletins active. Signal nominal.
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {alerts.map((alert) => {
              const cleanedMessage = alert.message
                .replace(/^[🔴🟡🟢]\s*/, '') // Strip leading emoji
                .replace(/^ALERT:\s*/, '') // Strip leading ALERT text
                .replace(/^INFO:\s*/, ''); // Strip leading INFO text
                
              const sev = getAlertSeverity(alert.message);
              const Icon = sev.icon;

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-3 rounded-lg border bg-slate-950/40 space-y-2 hover:bg-slate-900/30 transition-colors border-white/5`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border ${sev.color}`}>
                      <Icon size={10} />
                      {sev.label}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">{alert.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                    {cleanedMessage}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
