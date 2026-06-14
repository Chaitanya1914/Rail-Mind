'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Clock, ShieldAlert, Shuffle, MessageSquare, Cpu, AlertTriangle } from 'lucide-react';
import { AgentFeedItem } from '../../lib/api';

interface AgentFeedProps {
  feed: AgentFeedItem[];
}

const AGENT_CONFIG = {
  Anomaly: {
    color: 'text-[#06b6d4] border-[#06b6d4]/20 bg-[#06b6d4]/5',
    badgeColor: 'bg-[#06b6d4]/10 text-[#06b6d4]',
    icon: Eye
  },
  Delay: {
    color: 'text-[#00b4ff] border-[#00b4ff]/20 bg-[#00b4ff]/5',
    badgeColor: 'bg-[#00b4ff]/10 text-[#00b4ff]',
    icon: Clock
  },
  Safety: {
    color: 'text-[#ff3366] border-[#ff3366]/20 bg-[#ff3366]/5',
    badgeColor: 'bg-[#ff3366]/10 text-[#ff3366]',
    icon: ShieldAlert
  },
  Routing: {
    color: 'text-[#00ff88] border-[#00ff88]/20 bg-[#00ff88]/5',
    badgeColor: 'bg-[#00ff88]/10 text-[#00ff88]',
    icon: Shuffle
  },
  Comms: {
    color: 'text-[#ffd700] border-[#ffd700]/20 bg-[#ffd700]/5',
    badgeColor: 'bg-[#ffd700]/10 text-[#ffd700]',
    icon: MessageSquare
  },
  Orchestrator: {
    color: 'text-[#e2e8f0] border-white/10 bg-white/5',
    badgeColor: 'bg-white/10 text-[#e2e8f0]',
    icon: Cpu
  }
};

export default function AgentFeed({ feed }: AgentFeedProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <h2 className="text-sm font-semibold tracking-wider text-slate-300 uppercase font-mono">Agent Swarm Activity</h2>
        </div>
        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-mono">
          {feed.length} EVENTS
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px]">
        {feed.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono py-8">
            No agent events triggered yet. Initiating swarm...
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {feed.map((item) => {
              const cfg = AGENT_CONFIG[item.agent] || AGENT_CONFIG.Orchestrator;
              const Icon = cfg.icon;

              // Color-coding the status text inside item
              let statusColor = 'text-slate-400';
              if (item.status === 'RED') statusColor = 'text-[#ff3366] font-bold';
              else if (item.status === 'YELLOW') statusColor = 'text-[#ffd700] font-semibold';
              else if (item.status === 'GREEN') statusColor = 'text-[#00ff88]';

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 50, y: -10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`glass-card p-3 border border-white/5 hover:border-white/10 transition-colors flex flex-col gap-2`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={cfg.color.split(' ')[0]} />
                      <span className="text-xs font-bold font-mono tracking-wide text-slate-200">
                        {item.agent} Agent
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
                  </div>

                  <div className="text-xs text-slate-300 font-medium">
                    {item.message}
                  </div>

                  {/* Severity level bar if available */}
                  {item.severity !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-slate-500">
                        <span>SEVERITY INDEX</span>
                        <span className={statusColor}>{(item.severity * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.severity * 100}%`,
                            backgroundColor: item.status === 'RED' ? '#ff3366' : item.status === 'YELLOW' ? '#ffd700' : '#00ff88',
                            boxShadow: `0 0 8px ${item.status === 'RED' ? 'rgba(255,51,102,0.5)' : item.status === 'YELLOW' ? 'rgba(255,215,0,0.5)' : 'rgba(0,255,136,0.5)'}`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <span>Status:</span>
                    <span className={`inline-flex items-center gap-1 ${statusColor}`}>
                      {item.status === 'RED' && <AlertTriangle size={10} />}
                      {item.status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
