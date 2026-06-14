'use client';

import React, { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import ImpactStats from '@/components/Stats/ImpactStats';
import RailwayMap from '@/components/Map/RailwayMap';
import AgentFeed from '@/components/Feed/AgentFeed';
import CommsLog from '@/components/CommsLog/CommsLog';
import ConflictCard from '@/components/Conflicts/ConflictCard';
import ChatUI from '@/components/Features/ChatUI';
import FeatureImportance from '@/components/Features/FeatureImportance';
import SimControls from '@/components/Simulation/SimControls';
import AlertConsole from '@/components/Alerts/AlertConsole';
import DelayCards from '@/components/DelayCards/DelayCards';

function SkeletonPanel({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card p-4 ${className} overflow-hidden`}>
      <div className="skeleton h-3 w-1/3 mb-4 rounded"></div>
      <div className="skeleton h-2 w-full mb-2 rounded"></div>
      <div className="skeleton h-2 w-5/6 mb-2 rounded"></div>
      <div className="skeleton h-2 w-4/6 rounded"></div>
    </div>
  );
}

export default function Home() {
  const { state, loading, backendOnline, triggerSim } = useApi(2000);
  const [initialLoad, setInitialLoad] = useState(true);

  // Show loading skeletons only on very first load
  useEffect(() => {
    if (!loading || state.feed.length > 0) {
      setInitialLoad(false);
    }
  }, [loading, state.feed.length]);

  return (
    <main className="flex flex-col flex-1 h-screen w-screen bg-[#0a0e1a] text-[#e2e8f0] overflow-hidden font-sans">
      {/* Top Banner Stats Bar */}
      <ImpactStats stats={state.stats} backendOnline={backendOnline} />

      {/* Main Grid Workspace */}
      <div
        className="flex-1 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-3 p-3 min-h-0 overflow-y-auto lg:overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 56px)' }}
      >
        {/* ─── LEFT COLUMN: Map + Delay Metrics ─────────────────── */}
        <div className="flex flex-col gap-3 min-h-0">
          {/* Interactive Railway Map */}
          <div className="flex-1 min-h-[350px] lg:min-h-0 relative rounded-xl overflow-hidden border border-white/5 shadow-[0_0_40px_rgba(6,182,212,0.07)]">
            {initialLoad ? (
              <div className="w-full h-full bg-[#0a0e1a] flex items-center justify-center rounded-xl">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                  <p className="text-xs font-mono text-slate-400">Initializing Geospatial Grid...</p>
                </div>
              </div>
            ) : (
              <RailwayMap mapAlerts={state.mapAlerts} routeState={state.routeState} />
            )}
          </div>

          {/* Delay Analytics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-[220px] shrink-0">
            {initialLoad ? (
              <>
                <SkeletonPanel />
                <SkeletonPanel />
              </>
            ) : (
              <>
                <DelayCards delays={state.delays} />
                <FeatureImportance features={state.features} />
              </>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Swarm Intelligence Panels ──────────── */}
        <div className="flex flex-col gap-3 min-h-0 overflow-y-auto lg:overflow-y-auto scrollbar-thin">
          {/* Conflict Alert — only visible when a conflict is active */}
          <ConflictCard conflict={state.conflict} />

          {/* AI Assistant Chat UI */}
          <div className="shrink-0">
            <ChatUI />
          </div>

          {/* Agent Swarm Activity Feed */}
          <div className="rounded-xl border border-white/5 bg-[#111827]/40 overflow-hidden shrink-0">
            {initialLoad ? <SkeletonPanel /> : <AgentFeed feed={state.feed} />}
          </div>

          {/* Agent Inter-Comm Terminal */}
          <div className="rounded-xl overflow-hidden shrink-0">
            {initialLoad ? <SkeletonPanel className="bg-[#0d1117]" /> : <CommsLog log={state.log} />}
          </div>

          {/* Simulation Deck + Alert Console */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0 min-h-[220px]">
            {initialLoad ? (
              <>
                <SkeletonPanel />
                <SkeletonPanel />
              </>
            ) : (
              <>
                <SimControls
                  status={state.status}
                  scenario={state.scenario}
                  onTrigger={triggerSim}
                  loading={loading}
                />
                <AlertConsole log={state.log} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="shrink-0 border-t border-white/5 bg-[#0a0e1a]/80 px-6 py-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>
          🚂 <span className="text-cyan-400 font-bold">RAIL</span>MIND — Autonomous Railway Swarm Intelligence
        </span>
        <span className="flex items-center gap-3">
          <span>Faraway Hackathon 2026</span>
          <span className="border-l border-white/10 pl-3">v1.0.0-alpha</span>
          <span className="border-l border-white/10 pl-3">6 Agents Active</span>
        </span>
      </footer>
    </main>
  );
}
