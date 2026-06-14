import { useState, useEffect, useCallback } from 'react';
import {
  fetchAgentStatus,
  fetchCommsLog,
  fetchConflicts,
  fetchStats,
  fetchDelays,
  triggerSimulation,
  AgentFeedItem,
  CommsLogItem,
  ConflictData,
  ImpactStatsData,
  FeatureImportanceData,
  DelayCardData,
  MapAlertItem
} from '../lib/api';

export interface DashboardState {
  status: 'IDLE' | 'RUNNING' | 'COMPLETE';
  scenario: string;
  step: number;
  feed: AgentFeedItem[];
  log: CommsLogItem[];
  conflict: ConflictData | null;
  stats: ImpactStatsData;
  features: FeatureImportanceData[];
  delays: DelayCardData[];
  mapAlerts: MapAlertItem[];
  routeState: 'normal' | 'disrupted';
}

export function useApi(intervalMs = 2000) {
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(true);
  const [state, setState] = useState<DashboardState>({
    status: 'IDLE',
    scenario: 'none',
    step: 0,
    feed: [],
    log: [],
    conflict: null,
    stats: {
      trainsMonitored: 247,
      delaysPrevented: 12,
      activeAnomalies: 0,
      avgResponseTime: '2.1s',
      passengersAffected: 45000,
      safetyScore: 98,
      status: 'GREEN'
    },
    features: [
      { name: 'Weather Index', value: 12 },
      { name: 'Track Age', value: 18 },
      { name: 'Station Congestion', value: 15 },
      { name: 'Locomotive Wear', value: 10 },
      { name: 'Schedule Deviation', value: 8 }
    ],
    delays: [
      { id: '1', trainName: 'Rajdhani Express', trainNo: '12301', risk: 24, delayMins: 5, status: 'GREEN' },
      { id: '2', trainName: 'Shatabdi Express', trainNo: '12002', risk: 15, delayMins: 0, status: 'GREEN' },
      { id: '3', trainName: 'Duronto Express', trainNo: '12259', risk: 38, delayMins: 12, status: 'GREEN' }
    ],
    mapAlerts: [],
    routeState: 'normal'
  });

  const updateDashboard = useCallback(async () => {
    try {
      // Fetch status (which updates mock simulator automatically if backend is down)
      const agentStatus = await fetchAgentStatus();
      setBackendOnline(true);
      
      // If we got back a full mock state, use it directly
      if ('feed' in agentStatus) {
        setState(agentStatus);
      } else {
        // Otherwise parse individual live API responses
        const [commsLog, conflicts, stats, delays] = await Promise.all([
          fetchCommsLog(),
          fetchConflicts(),
          fetchStats(),
          fetchDelays()
        ]);
        
        setState((prev) => ({
          ...prev,
          status: agentStatus.status || 'IDLE',
          scenario: agentStatus.scenario || 'none',
          step: agentStatus.step || 0,
          feed: agentStatus.feed || [],
          log: commsLog || [],
          conflict: conflicts || null,
          stats: stats || prev.stats,
          delays: delays || prev.delays,
          mapAlerts: agentStatus.mapAlerts || [],
          routeState: agentStatus.routeState || 'normal',
          features: agentStatus.features || prev.features
        }));
      }
    } catch (err) {
      console.error('API Error, check backend', err);
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    updateDashboard();
    const id = setInterval(updateDashboard, intervalMs);
    return () => clearInterval(id);
  }, [updateDashboard, intervalMs]);

  const triggerSim = async (scenario: string) => {
    setLoading(true);
    try {
      const response = await triggerSimulation(scenario);
      if ('feed' in response) {
        setState(response);
      } else {
        await updateDashboard();
      }
    } catch (err) {
      console.error('Failed to trigger simulation', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    state,
    loading,
    backendOnline,
    triggerSim,
    refresh: updateDashboard
  };
}
