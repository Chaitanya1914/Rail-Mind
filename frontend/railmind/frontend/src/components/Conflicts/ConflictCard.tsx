'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Zap, Scale, Brain } from 'lucide-react';
import { ConflictData } from '../../lib/api';

interface ConflictCardProps {
  conflict: ConflictData | null;
}

export default function ConflictCard({ conflict }: ConflictCardProps) {
  if (!conflict || !conflict.active) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          boxShadow: [
            '0 0 15px rgba(255,51,102,0.3)',
            '0 0 25px rgba(255,51,102,0.5)',
            '0 0 20px rgba(0,255,136,0.3)'
          ]
        }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{
          duration: 0.8,
          ease: 'easeOut',
          boxShadow: {
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 2
          }
        }}
        className="glass-card p-5 border border-red-500/30 bg-slate-950/90 relative overflow-hidden"
      >
        {/* Background glow flare */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -ml-6 -mb-6"></div>

        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-red-500/20 text-[#ff3366] animate-pulse">
              <Scale size={16} />
            </div>
            <h3 className="text-xs font-bold font-mono tracking-widest text-[#ff3366] uppercase">
              Conflict Detected & Resolved
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
            <span>Swarm Resolve:</span>
            <span className="text-[#00ff88] font-bold">{conflict.resolvedIn}</span>
          </div>
        </div>

        {/* Dispute grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Dispute Agent A */}
          <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/10 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="text-[#00b4ff]" />
              <span className="text-[10px] font-bold font-mono text-[#00b4ff]">
                {conflict.agentA}
              </span>
            </div>
            <p className="text-xs italic text-slate-300 font-sans leading-relaxed">
              &quot;{conflict.messageA}&quot;
            </p>
          </div>

          {/* Dispute Agent B */}
          <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/10 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-[#ff3366]" />
              <span className="text-[10px] font-bold font-mono text-[#ff3366]">
                {conflict.agentB}
              </span>
            </div>
            <p className="text-xs italic text-slate-300 font-sans leading-relaxed">
              &quot;{conflict.messageB}&quot;
            </p>
          </div>
        </div>

        {/* Decision Banner */}
        <div className="p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20 space-y-2">
          <div className="flex items-center gap-2 text-[#00ff88]">
            <Brain size={16} className="animate-pulse" />
            <span className="text-[11px] font-bold font-mono uppercase tracking-wider">
              Orchestrator Swarm Resolution
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div>
              <span className="text-slate-500 font-mono text-[10px]">ENFORCED ACTION:</span>{' '}
              <strong className="text-[#00ff88] font-mono tracking-wide">{conflict.decision}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-mono text-[10px]">RATIONALE:</span>{' '}
              <span className="text-slate-200 font-sans">{conflict.reason}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
