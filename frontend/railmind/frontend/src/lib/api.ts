export const API_BASE = 'http://localhost:8000';

export interface AgentFeedItem {
  id: string;
  timestamp: string;
  agent: 'Anomaly' | 'Delay' | 'Safety' | 'Routing' | 'Comms' | 'Orchestrator';
  title: string;
  message: string;
  severity?: number; // 0 to 1
  status: 'GREEN' | 'YELLOW' | 'RED' | 'INFO';
}

export interface CommsLogItem {
  id: string;
  timestamp: string;
  from: string;
  to: string;
  message: string;
}

export interface ConflictData {
  active: boolean;
  agentA: string;
  messageA: string;
  agentB: string;
  messageB: string;
  decision: string;
  reason: string;
  resolvedIn: string;
}

export interface ImpactStatsData {
  trainsMonitored: number;
  delaysPrevented: number;
  activeAnomalies: number;
  avgResponseTime: string;
  passengersAffected: number;
  safetyScore: number;
  status: 'GREEN' | 'YELLOW' | 'RED';
}

export interface FeatureImportanceData {
  name: string;
  value: number;
}

export interface DelayCardData {
  id: string;
  trainName: string;
  trainNo: string;
  risk: number; // 0 to 100
  delayMins: number;
  status: 'GREEN' | 'YELLOW' | 'RED';
}

export interface MapAlertItem {
  id: string;
  lat: number;
  lng: number;
  station: string;
  type: 'crack' | 'signal' | 'flood' | 'derailment' | 'none';
  severity: 'GREEN' | 'YELLOW' | 'RED';
}

// Client-side mock state to fall back to when backend is offline
class MockSimulator {
  private status: 'IDLE' | 'RUNNING' | 'COMPLETE' = 'IDLE';
  private scenario: string = 'none';
  private step: number = 0;
  private feed: AgentFeedItem[] = [];
  private log: CommsLogItem[] = [];
  private conflict: ConflictData | null = null;
  private stats: ImpactStatsData = {
    trainsMonitored: 247,
    delaysPrevented: 12,
    activeAnomalies: 0,
    avgResponseTime: '2.3s',
    passengersAffected: 45000,
    safetyScore: 98,
    status: 'GREEN'
  };
  private features: FeatureImportanceData[] = [
    { name: 'Weather Index', value: 12 },
    { name: 'Track Age', value: 18 },
    { name: 'Station Congestion', value: 15 },
    { name: 'Locomotive Wear', value: 10 },
    { name: 'Schedule Deviation', value: 8 }
  ];
  private delays: DelayCardData[] = [
    { id: '1', trainName: 'Rajdhani Express', trainNo: '12301', risk: 24, delayMins: 5, status: 'GREEN' },
    { id: '2', trainName: 'Shatabdi Express', trainNo: '12002', risk: 15, delayMins: 0, status: 'GREEN' },
    { id: '3', trainName: 'Duronto Express', trainNo: '12259', risk: 38, delayMins: 12, status: 'GREEN' }
  ];
  private mapAlerts: MapAlertItem[] = [];
  private routeState: 'normal' | 'disrupted' = 'normal';

  constructor() {
    this.resetMock();
  }

  public resetMock() {
    this.status = 'IDLE';
    this.scenario = 'none';
    this.step = 0;
    this.feed = [
      {
        id: 'init-1',
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Orchestrator',
        title: 'System Initialized',
        message: 'RailMind Swarm Operations active. Monitoring India Rail corridor.',
        status: 'INFO'
      }
    ];
    this.log = [
      {
        id: 'l-init-1',
        timestamp: new Date().toLocaleTimeString(),
        from: '🧠 Orchestrator',
        to: 'Swarm',
        message: 'All monitoring modules active. Safety levels nominal.'
      }
    ];
    this.conflict = null;
    this.stats = {
      trainsMonitored: 247,
      delaysPrevented: 12,
      activeAnomalies: 0,
      avgResponseTime: '2.1s',
      passengersAffected: 45000,
      safetyScore: 98,
      status: 'GREEN'
    };
    this.features = [
      { name: 'Weather Index', value: 12 },
      { name: 'Track Age', value: 18 },
      { name: 'Station Congestion', value: 15 },
      { name: 'Locomotive Wear', value: 10 },
      { name: 'Schedule Deviation', value: 8 }
    ];
    this.delays = [
      { id: '1', trainName: 'Rajdhani Express', trainNo: '12301', risk: 24, delayMins: 5, status: 'GREEN' },
      { id: '2', trainName: 'Shatabdi Express', trainNo: '12002', risk: 15, delayMins: 0, status: 'GREEN' },
      { id: '3', trainName: 'Duronto Express', trainNo: '12259', risk: 38, delayMins: 12, status: 'GREEN' }
    ];
    this.mapAlerts = [];
    this.routeState = 'normal';
  }

  public trigger(scenario: string) {
    this.resetMock();
    this.status = 'RUNNING';
    this.scenario = scenario;
    this.step = 1;
    this.processStep();
  }

  public tick() {
    if (this.status !== 'RUNNING') return;
    this.step += 1;
    this.processStep();
  }

  private addFeed(agent: any, title: string, message: string, status: any, severity?: number) {
    this.feed = [
      {
        id: `feed-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        agent,
        title,
        message,
        status,
        severity
      },
      ...this.feed
    ];
  }

  private addLog(from: string, to: string, message: string) {
    this.log = [
      ...this.log,
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        from,
        to,
        message
      }
    ];
  }

  private processStep() {
    const time = new Date().toLocaleTimeString();
    if (this.scenario === 'flood') {
      switch (this.step) {
        case 1:
          this.addFeed('Anomaly', 'Water Accumulation', 'Heavy rainfall causing water pooling on tracks near Kanpur Jn. (KM 210)', 'YELLOW', 0.65);
          this.addLog('🔍 Anomaly Agent', '🧠 Orchestrator', 'Water pooling detected near Kanpur Jn. level sensors rising.');
          this.stats.activeAnomalies = 1;
          this.stats.safetyScore = 95;
          this.stats.status = 'YELLOW';
          this.mapAlerts = [{ id: 'ma-1', lat: 26.4499, lng: 80.3319, station: 'Kanpur Central', type: 'flood', severity: 'YELLOW' }];
          break;
        case 2:
          this.addFeed('Safety', 'Safety Level Escalation', 'Track flooding risk is critical. Water level at 120mm above rail head.', 'RED', 0.92);
          this.addLog('🧠 Orchestrator', '⚠️ Safety Agent', 'Evaluate risk index for Section 42 (Kanpur).');
          this.addLog('⚠️ Safety Agent', '🧠 Orchestrator', 'RED safety alert. Risk index 0.92. Recommend immediate traffic hold.');
          this.stats.safetyScore = 80;
          this.stats.status = 'RED';
          this.mapAlerts[0].severity = 'RED';
          break;
        case 3:
          this.conflict = {
            active: true,
            agentA: '📊 Delay Agent',
            messageA: 'Maintain schedule. Advise trains to proceed at caution speed (15 km/h) to prevent cascading gridlock.',
            agentB: '⚠️ Safety Agent',
            messageB: 'Halt all approaching traffic immediately. Severe risk of water ingress and derailment.',
            decision: 'HALT ALL TRAINS (Zone 4)',
            reason: 'Safety First Policy — Track inundation depth (>100mm) overrides operational schedule priority.',
            resolvedIn: '1.4 seconds'
          };
          this.addLog('🧠 Orchestrator', 'Conflict Resolution', 'Resolving dispute: Delay Agent (Slow Crawl) vs Safety Agent (Absolute Halt).');
          break;
        case 4:
          if (this.conflict) this.conflict.active = false;
          this.addFeed('Orchestrator', 'Emergency Stop Enforced', 'Halt command broadcast to all trains within 50km of Kanpur Central.', 'RED');
          this.addLog('🧠 Orchestrator', 'Swarm', 'Emergency stop broadcast sent. Halting 3 trains approaching Kanpur Central.');
          this.delays = [
            { id: '1', trainName: 'Rajdhani Express', trainNo: '12301', risk: 95, delayMins: 90, status: 'RED' },
            { id: '2', trainName: 'Shatabdi Express', trainNo: '12002', risk: 85, delayMins: 60, status: 'RED' },
            { id: '3', trainName: 'Duronto Express', trainNo: '12259', risk: 50, delayMins: 30, status: 'YELLOW' }
          ];
          break;
        case 5:
          this.addFeed('Routing', 'Alternative Route Proposed', 'Diverting at-risk trains via Lucknow bypass. Clears Kanpur gridlock.', 'GREEN');
          this.addLog('🧠 Orchestrator', '🔄 Routing Agent', 'Request detour routing options for Rajdhani 12301.');
          this.addLog('🔄 Routing Agent', '🧠 Orchestrator', ' Lucknow bypass path computed. Adds 35m transit time. Bypasses Kanpur Jn.');
          this.routeState = 'disrupted';
          break;
        case 6:
          this.addFeed('Comms', 'Alerts Generated', 'Natural language passenger notifications dispatched to Vikalp SMS portal.', 'GREEN');
          this.addLog('🧠 Orchestrator', '📢 Comms Agent', 'Synthesize public safety broadcasts for Kanpur reroutes.');
          this.addLog('📢 Comms Agent', 'Vikalp Portal', '🔴 ALERT: Train 12301 Rajdhani Express rerouted via Lucknow due to track flooding. ETA +35m. Platform changes expected.');
          this.stats.delaysPrevented += 2;
          this.stats.safetyScore = 96;
          this.stats.status = 'YELLOW';
          break;
        case 7:
          this.status = 'COMPLETE';
          this.addFeed('Orchestrator', 'Stabilized Operations', 'Reroutes active. Normal flow maintained outside Kanpur sector.', 'GREEN');
          this.addLog('🧠 Orchestrator', 'Swarm', 'Simulation complete. Swarm stabilized operations via Lucknow.');
          break;
      }
    } else if (this.scenario === 'signal') {
      switch (this.step) {
        case 1:
          this.addFeed('Anomaly', 'Signal Failure', 'Interlocking signal fail near Kanpur station (intermittent logic faults)', 'YELLOW', 0.72);
          this.addLog('🔍 Anomaly Agent', '🧠 Orchestrator', 'Signal post 8B telemetry is mismatching. Relay lock fault.');
          this.stats.activeAnomalies = 1;
          this.stats.status = 'YELLOW';
          this.mapAlerts = [{ id: 'ma-2', lat: 26.4499, lng: 80.3319, station: 'Kanpur Central', type: 'signal', severity: 'YELLOW' }];
          break;
        case 2:
          this.addFeed('Safety', 'Caution Notice Issued', 'Yellow alert for Section 42. Speed restriction: 30 km/h.', 'YELLOW', 0.5);
          this.addLog('🧠 Orchestrator', '⚠️ Safety Agent', 'Analyze interlocking crash risk at Kanpur Junction.');
          this.addLog('⚠️ Safety Agent', '🧠 Orchestrator', 'Caution advised. Signal logic fallback active. Max speed 30km/h.');
          break;
        case 3:
          this.addFeed('Delay', 'Delay Cascade Warning', 'Rajdhani 12301 delay probability spiked to 89%. ETA +45m.', 'YELLOW');
          this.addLog('🧠 Orchestrator', '📊 Delay Agent', 'Run delay prediction for Rajdhani 12301 on Kanpur caution corridor.');
          this.addLog('📊 Delay Agent', '🧠 Orchestrator', 'XGBoost predicts 89% delay risk. Primary feature: Signal Caution restriction (55%).');
          this.features = [
            { name: 'Signal Caution', value: 55 },
            { name: 'Station Congestion', value: 20 },
            { name: 'Schedule Buffer', value: 12 },
            { name: 'Locomotive Age', value: 8 },
            { name: 'Weather Index', value: 5 }
          ];
          this.delays[0] = { id: '1', trainName: 'Rajdhani Express', trainNo: '12301', risk: 89, delayMins: 45, status: 'YELLOW' };
          break;
        case 4:
          this.addFeed('Comms', 'Passenger Update', 'SMS alert synthesized for at-risk journeys.', 'GREEN');
          this.addLog('📢 Comms Agent', 'Broadcast', '🟡 INFO: Train 12301 expected to experience a 45-minute delay due to signal relay maintenance near Kanpur.');
          this.stats.delaysPrevented += 1;
          this.status = 'COMPLETE';
          break;
      }
    } else if (this.scenario === 'derailment') {
      switch (this.step) {
        case 1:
          this.addFeed('Anomaly', 'Critical Track Crack', 'Crack detected in weld joint at KM 342. High derailment risk.', 'RED', 0.97);
          this.addLog('🔍 Anomaly Agent', '🧠 Orchestrator', 'YOLOv8 fine-tuned model reports transverse weld defect (severity 0.97) at KM 342.');
          this.stats.activeAnomalies = 1;
          this.stats.safetyScore = 60;
          this.stats.status = 'RED';
          this.mapAlerts = [{ id: 'ma-3', lat: 26.5400, lng: 80.1200, station: 'Weld joint KM 342', type: 'crack', severity: 'RED' }];
          break;
        case 2:
          this.addFeed('Safety', 'Emergency Intervention', 'RED safety alert. Halting all movements on Main Line.', 'RED', 0.99);
          this.addLog('🧠 Orchestrator', '⚠️ Safety Agent', 'CRITICAL weld defect reported. Verify lockouts.');
          this.addLog('⚠️ Safety Agent', '🧠 Orchestrator', 'Main Line lockout active. Diverting or halting all approaching trains.');
          break;
        case 3:
          this.conflict = {
            active: true,
            agentA: '📊 Delay Agent',
            messageA: 'Route train via siding line at 10 km/h to avoid full stop block.',
            agentB: '⚠️ Safety Agent',
            messageB: 'Visual weld defect represents total integrity failure. Total lock required until weld crew inspects.',
            decision: 'TOTAL LINE BLOCK - REPAIR CREW DISPATCHED',
            reason: 'Safety First override — siding line clearance cannot be verified. Derailment risk too high.',
            resolvedIn: '0.9 seconds'
          };
          this.addLog('🧠 Orchestrator', 'Conflict Resolution', 'Resolving dispute: Siding crawl vs Total Lockout.');
          break;
        case 4:
          if (this.conflict) this.conflict.active = false;
          this.addFeed('Routing', 'Line Closure Rerouting', 'Routing Rajdhani 12301 via North Loop.', 'YELLOW');
          this.addLog('🔄 Routing Agent', '🧠 Orchestrator', 'Main line blocked at KM 342. Rerouting via North Loop bypass.');
          this.delays = [
            { id: '1', trainName: 'Rajdhani Express', trainNo: '12301', risk: 98, delayMins: 75, status: 'RED' },
            { id: '2', trainName: 'Shatabdi Express', trainNo: '12002', risk: 90, delayMins: 50, status: 'RED' },
            { id: '3', trainName: 'Duronto Express', trainNo: '12259', risk: 70, delayMins: 40, status: 'YELLOW' }
          ];
          break;
        case 5:
          this.addFeed('Comms', 'Critical Alerts Sent', 'Passenger SMS and station PA systems updated.', 'RED');
          this.addLog('📢 Comms Agent', 'Station PA', '🔴 EMERGENCY: Express services between Kanpur and Delhi are delayed due to track maintenance at KM 342. Train 12301 delayed by 75m.');
          this.stats.safetyScore = 95;
          this.stats.status = 'YELLOW';
          this.status = 'COMPLETE';
          break;
      }
    } else if (this.scenario === 'compound') {
      switch (this.step) {
        case 1:
          this.addFeed('Anomaly', 'Multiple Incidents', 'Monsoon storms causing signal faults and track debris.', 'RED', 0.88);
          this.addLog('🔍 Anomaly Agent', '🧠 Orchestrator', 'Multiple alerts: Track debris at KM 205 + signal post 4 lock failure.');
          this.stats.activeAnomalies = 2;
          this.stats.status = 'RED';
          this.mapAlerts = [
            { id: 'ma-4a', lat: 26.4499, lng: 80.3319, station: 'Kanpur Central', type: 'signal', severity: 'YELLOW' },
            { id: 'ma-4b', lat: 26.3500, lng: 80.4500, station: 'Debris KM 205', type: 'crack', severity: 'RED' }
          ];
          break;
        case 2:
          this.addFeed('Safety', 'Compound Danger Rating', 'High Risk. Safety Score drops to 55%.', 'RED', 0.95);
          this.addLog('🧠 Orchestrator', '⚠️ Safety Agent', 'Evaluate compound failure indices.');
          this.addLog('⚠️ Safety Agent', '🧠 Orchestrator', 'RED status. Recommending grid freeze for Zone 4.');
          this.stats.safetyScore = 55;
          break;
        case 3:
          this.addFeed('Delay', 'Grid Delay Cascade', 'XGBoost predicts >90% delays across 5 routes.', 'RED');
          this.addLog('📊 Delay Agent', '🧠 Orchestrator', 'Delay cascades starting. Trains 12301, 12002, 12259 gridlocked.');
          this.delays = [
            { id: '1', trainName: 'Rajdhani Express', trainNo: '12301', risk: 99, delayMins: 110, status: 'RED' },
            { id: '2', trainName: 'Shatabdi Express', trainNo: '12002', risk: 95, delayMins: 80, status: 'RED' },
            { id: '3', trainName: 'Duronto Express', trainNo: '12259', risk: 90, delayMins: 70, status: 'RED' }
          ];
          break;
        case 4:
          this.addFeed('Routing', 'Global Congestion Reroute', 'Executing compound detour bypass.', 'GREEN');
          this.addLog('🔄 Routing Agent', '🧠 Orchestrator', 'Compound bypass active via Lucknow Loop + Siding 2.');
          this.routeState = 'disrupted';
          break;
        case 5:
          this.addFeed('Comms', 'Mass Alerts', 'Broadcasting delay updates to Vikalp portals.', 'GREEN');
          this.addLog('📢 Comms Agent', 'Bulk Broadcast', '🔴 CRITICAL: Extreme weather is disrupting all rail paths through Kanpur. Delayed services expect +90m delays. Alternative routes in operation.');
          this.stats.delaysPrevented += 4;
          this.stats.safetyScore = 90;
          this.stats.status = 'YELLOW';
          this.status = 'COMPLETE';
          break;
      }
    }
  }

  public getMockState() {
    return {
      status: this.status,
      scenario: this.scenario,
      step: this.step,
      feed: this.feed,
      log: this.log,
      conflict: this.conflict,
      stats: this.stats,
      features: this.features,
      delays: this.delays,
      mapAlerts: this.mapAlerts,
      routeState: this.routeState
    };
  }
}

export const mockSimulator = new MockSimulator();

// API polling & fetch helper
export async function fetchAgentStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/agents/status`);
    if (!res.ok) throw new Error('API down');
    return await res.json();
  } catch (err) {
    // Return mock fallback
    mockSimulator.tick();
    return mockSimulator.getMockState();
  }
}

export async function fetchCommsLog() {
  try {
    const res = await fetch(`${API_BASE}/api/comms/log`);
    if (!res.ok) throw new Error('API down');
    return await res.json();
  } catch (err) {
    return mockSimulator.getMockState().log;
  }
}

export async function fetchConflicts() {
  try {
    const res = await fetch(`${API_BASE}/api/conflicts`);
    if (!res.ok) throw new Error('API down');
    return await res.json();
  } catch (err) {
    return mockSimulator.getMockState().conflict;
  }
}

export async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/api/stats`);
    if (!res.ok) throw new Error('API down');
    return await res.json();
  } catch (err) {
    return mockSimulator.getMockState().stats;
  }
}

export async function fetchDelays() {
  try {
    const res = await fetch(`${API_BASE}/api/delays/predict`);
    if (!res.ok) throw new Error('API down');
    return await res.json();
  } catch (err) {
    return mockSimulator.getMockState().delays;
  }
}

export async function triggerSimulation(scenario: string) {
  try {
    const res = await fetch(`${API_BASE}/api/simulate/${scenario}`, { method: 'POST' });
    if (!res.ok) throw new Error('API down');
    return await res.json();
  } catch (err) {
    if (scenario === 'none') {
      mockSimulator.resetMock();
    } else {
      mockSimulator.trigger(scenario);
    }
    return mockSimulator.getMockState();
  }
}
