'use client';

import React, { useEffect, useRef } from 'react';
import { Terminal, Copy, Trash2 } from 'lucide-react';
import { CommsLogItem } from '../../lib/api';

interface CommsLogProps {
  log: CommsLogItem[];
}

export default function CommsLog({ log }: CommsLogProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as new messages arrive
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  const copyToClipboard = () => {
    const text = log
      .map((item) => `[${item.timestamp}] ${item.from} → ${item.to}: "${item.message}"`)
      .join('\n');
    navigator.clipboard.writeText(text);
  };

  const getAgentColorClass = (name: string) => {
    if (name.includes('Anomaly') || name.includes('🔍')) return 'text-[#06b6d4] font-semibold';
    if (name.includes('Delay') || name.includes('📊')) return 'text-[#00b4ff] font-semibold';
    if (name.includes('Safety') || name.includes('⚠️')) return 'text-[#ff3366] font-semibold';
    if (name.includes('Routing') || name.includes('🔄')) return 'text-[#00ff88] font-semibold';
    if (name.includes('Comms') || name.includes('📢')) return 'text-[#ffd700] font-semibold';
    return 'text-[#e2e8f0] font-semibold'; // Orchestrator or other
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] rounded-xl border border-white/5 comms-animated-border shadow-2xl overflow-hidden font-mono">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-cyan-400" />
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Agent Inter-Comm Terminal
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={copyToClipboard}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            title="Copy logs to clipboard"
          >
            <Copy size={12} />
          </button>
        </div>
      </div>

      {/* Terminal log logs */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[300px] text-[11px] leading-relaxed text-[#c9d1d9]">
        {log.length === 0 ? (
          <div className="text-slate-500 italic py-8 flex flex-col gap-2">
            <span>[SYSTEM] Awaiting agent communication protocols...</span>
            <div className="flex gap-1 items-center">
              <span className="w-2 h-3 bg-cyan-400 animate-pulse"></span>
            </div>
          </div>
        ) : (
          log.map((item) => (
            <div key={item.id} className="border-l border-white/5 pl-3 space-y-1 py-1 hover:bg-white/[0.01] transition-colors">
              <div className="flex flex-wrap items-center gap-1.5 text-slate-500 text-[10px]">
                <span>[{item.timestamp}]</span>
                <span className={getAgentColorClass(item.from)}>{item.from}</span>
                <span>➔</span>
                <span className={getAgentColorClass(item.to)}>{item.to}</span>
              </div>
              <div className="text-slate-300 font-medium pl-1 text-[11px] select-text">
                &quot;{item.message}&quot;
              </div>
            </div>
          ))
        )}
        {log.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-cyan-400/50 italic py-1">
            <span>[MONITORING CORRIDOR ACTIVE]</span>
            <span className="w-1.5 h-3.5 bg-cyan-400 inline-block animate-pulse"></span>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
