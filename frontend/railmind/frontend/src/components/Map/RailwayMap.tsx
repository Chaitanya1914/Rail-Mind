'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the MapInner component with SSR disabled
const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[#0a0e1a] rounded-xl border border-white/5">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Loading Geospatial Railway Layer...</p>
      </div>
    </div>
  )
});

interface RailwayMapProps {
  mapAlerts: any[];
  routeState: 'normal' | 'disrupted';
}

export default function RailwayMap({ mapAlerts, routeState }: RailwayMapProps) {
  return (
    <div className="w-full h-full relative min-h-[400px] overflow-hidden rounded-xl border border-white/5 shadow-2xl">
      <MapInner mapAlerts={mapAlerts} routeState={routeState} />
    </div>
  );
}
