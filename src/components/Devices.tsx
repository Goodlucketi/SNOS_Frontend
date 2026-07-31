import React, { useEffect, useState } from 'react';
import { Radio, Wifi, WifiOff, MapPin, Cpu } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface Sensor {
  id: string;
  gateway_id: string;
  client_id: string;
  home_id: string | null;
  automation_id: string | null;
  rf_code: string | null;
  message: string | null;
  trigger_topic: string | null;
  is_sensing: boolean;
  status: string | null;
  created_at: string;
  updated_at: string;
  timestamptz: string | null;
  last_triggered_at: string | null;
}

interface Gateway {
  id: string;
  home_id: string | null;
  name: string | null;
  mesh_address: string | null;
  status: string | null;
  created_at: string;
  cert_fingerprint: string | null;
  enrolled_at: string | null;
  last_seen_at: string | null;
  agent_version: string | null;
  service_health: string | null;
  service_health_at: string | null;
  client_id: string;
  sensors?: Sensor[];
}

// A node (gateway or sensor) counts as "online" if it's checked in within this window.
const ONLINE_THRESHOLD_MINUTES = 10;

const isOnline = (lastSeen?: string) => {
  if (!lastSeen) return false;
  const diffMs = Date.now() - new Date(lastSeen).getTime();
  return diffMs < ONLINE_THRESHOLD_MINUTES * 60 * 1000;
};

const timeAgo = (timestamp?: string) => {
  if (!timestamp) return 'Never';
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// Dummy gateway & sensor data shown when no real gateways are registered.
// Timestamps are pinned relative to Date.now() so "Just now" / "Xm ago" stay accurate.
const NOW = Date.now();
const MIN = 60_000;

function minutesAgo(n: number) {
  return new Date(NOW - n * MIN).toISOString();
}

const DUMMY_GATEWAYS: Gateway[] = [
  {
    id: "GW-8F3A-001",
    client_id: "demo",
    home_id: null,
    name: "Perimeter Fence — Sector A",
    mesh_address: "0x8f3a001",
    status: "online",
    created_at: "2025-11-15T10:30:00Z",
    cert_fingerprint: null,
    enrolled_at: "2025-11-15T10:30:00Z",
    last_seen_at: minutesAgo(1),
    agent_version: "1.2.3",
    service_health: "healthy",
    service_health_at: minutesAgo(1),
    sensors: [
      {
        id: "SENS-001",
        gateway_id: "GW-8F3A-001",
        client_id: "demo",
        home_id: null,
        automation_id: null,
        rf_code: "VIB-001",
        message: "Vibration / Seismic",
        trigger_topic: null,
        is_sensing: true,
        status: "active",
        created_at: "2025-11-15T10:30:00Z",
        updated_at: "2025-11-15T10:30:00Z",
        timestamptz: minutesAgo(1),
        last_triggered_at: minutesAgo(1)
      },
      {
        id: "SENS-002",
        gateway_id: "GW-8F3A-001",
        client_id: "demo",
        home_id: null,
        automation_id: null,
        rf_code: "PIR-001",
        message: "PIR / Motion",
        trigger_topic: null,
        is_sensing: true,
        status: "active",
        created_at: "2025-11-15T10:30:00Z",
        updated_at: "2025-11-15T10:30:00Z",
        timestamptz: minutesAgo(3),
        last_triggered_at: minutesAgo(3)
      },
      {
        id: "SENS-003",
        gateway_id: "GW-8F3A-001",
        client_id: "demo",
        home_id: null,
        automation_id: null,
        rf_code: "ACO-001",
        message: "Acoustic / Glass-break",
        trigger_topic: null,
        is_sensing: false,
        status: "inactive",
        created_at: "2025-11-15T10:30:00Z",
        updated_at: "2025-11-15T10:30:00Z",
        timestamptz: minutesAgo(48),
        last_triggered_at: minutesAgo(48)
      },
    ],
  },
  {
    id: "GW-B72D-2",
    client_id: "demo-client",
    home_id: null,
    name: "Indoor Server Room",
    mesh_address: "0xb72d002",
    status: "online",
    created_at: "2025-09-01T08:15:00Z",
    cert_fingerprint: null,
    enrolled_at: "2025-09-01T08:15:00Z",
    last_seen_at: minutesAgo(0.3),
    agent_version: "1.2.3",
    service_health: "healthy",
    service_health_at: minutesAgo(0.3),
    sensors: [
      {
        id: "SENS-004",
        gateway_id: "GW-B72D-2",
        client_id: "demo-client",
        home_id: null,
        automation_id: null,
        rf_code: "TMP-001",
        message: "Temperature",
        trigger_topic: null,
        is_sensing: true,
        status: "active",
        created_at: "2025-09-01T08:15:00Z",
        updated_at: "2025-09-01T08:15:00Z",
        timestamptz: minutesAgo(0.5),
        last_triggered_at: minutesAgo(0.5)
      },
      {
        id: "SENS-005",
        gateway_id: "GW-B72D-2",
        client_id: "demo-client",
        home_id: null,
        automation_id: null,
        rf_code: "SMK-001",
        message: "Smoke / CO",
        trigger_topic: null,
        is_sensing: true,
        status: "active",
        created_at: "2025-09-01T08:15:00Z",
        updated_at: "2025-09-01T08:15:00Z",
        timestamptz: minutesAgo(1),
        last_triggered_at: minutesAgo(1)
      },
      {
        id: "SENS-006",
        gateway_id: "GW-B72D-2",
        client_id: "demo-client",
        home_id: null,
        automation_id: null,
        rf_code: "FLD-001",
        message: "Flood / Leak",
        trigger_topic: null,
        is_sensing: false,
        status: "inactive",
        created_at: "2025-09-01T08:15:00Z",
        updated_at: "2025-09-01T08:15:00Z",
        timestamptz: minutesAgo(120),
        last_triggered_at: minutesAgo(120)
      },
      {
        id: "SENS-007",
        gateway_id: "GW-B72D-2",
        client_id: "demo-client",
        home_id: null,
        automation_id: null,
        rf_code: "DRS-001",
        message: "Door / Reed Switch",
        trigger_topic: null,
        is_sensing: true,
        status: "active",
        created_at: "2025-09-01T08:15:00Z",
        updated_at: "2025-09-01T08:15:00Z",
        timestamptz: minutesAgo(0.2),
        last_triggered_at: minutesAgo(0.2)
      },
    ],
  },
];

const Devices: React.FC = () => {
  const { clientData } = useAuth();
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDummyData, setUsingDummyData] = useState(false);

  // Track sensing toggle state per sensor (keyed by sensor.id).
  // Initialised from the gateway/sensor data once it loads.
  const [sensingStates, setSensingStates] = useState<Record<string, boolean>>({});

  const toggleSensing = (sensorId: string) => {
    setSensingStates(prev => ({ ...prev, [sensorId]: !prev[sensorId] }));
    // TODO: push to backend e.g. POST /api/sensors/toggle.php
  };

  // Seed sensingStates whenever gateways change (real or dummy).
  useEffect(() => {
    const states: Record<string, boolean> = {};
    gateways.forEach(gw => {
      gw.sensors?.forEach(s => {
        states[s.id] = s.is_sensing ?? true;
      });
    });
    setSensingStates(states);
  }, [gateways]);

  useEffect(() => {
    let cancelled = false;

    const fetchGateways = async () => {
      // Use clientData.id which is the clients table ID, not the auth user ID
      const clientId = clientData?.id;

      console.log('Devices effect running, clientData:', clientData);

      if (!clientId) {
        console.log('No client ID available yet');
        if (!cancelled) {
          setGateways(DUMMY_GATEWAYS);
          setUsingDummyData(true);
          setLoading(false);
        }
        return;
      }

      console.log('Fetching gateways for client:', clientId);

      // Fetch gateways first, then fetch their sensors from rf_sensors table
      // using the gateway_id foreign key
      const { data: gatewaysData, error: gatewaysError } = await supabase
        .from('gateways')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (gatewaysError) {
        console.error('Error fetching gateways:', gatewaysError.message);
        setGateways(DUMMY_GATEWAYS);
        setUsingDummyData(true);
        setLoading(false);
        return;
      }

      console.log('Gateways found:', gatewaysData?.length, gatewaysData);

      if (!gatewaysData || gatewaysData.length === 0) {
        console.log('No gateways for client, showing dummy');
        setGateways(DUMMY_GATEWAYS);
        setUsingDummyData(true);
        setLoading(false);
        return;
      }

      // Fetch sensors for all gateways from rf_sensors table
      const gatewayIds = gatewaysData.map(gw => gw.id);
      console.log('Fetching sensors for gateway IDs:', gatewayIds);

      const { data: sensorsData, error: sensorsError } = await supabase
        .from('rf_sensors')
        .select('*')
        .in('gateway_id', gatewayIds);

      if (cancelled) return;

      if (sensorsError) {
        console.error('Error fetching sensors:', sensorsError.message);
      }

      console.log('Sensors found:', sensorsData?.length, sensorsData);

      // Group sensors by gateway_id
      const sensorsByGateway = (sensorsData || []).reduce((acc, sensor) => {
        if (!acc[sensor.gateway_id]) {
          acc[sensor.gateway_id] = [];
        }
        acc[sensor.gateway_id].push(sensor);
        return acc;
      }, {} as Record<string, Sensor[]>);

      // Combine gateways with their sensors
      const gatewaysWithSensors = gatewaysData.map(gateway => ({
        ...gateway,
        sensors: sensorsByGateway[gateway.id] || []
      }));

      console.log('Final gateways with sensors:', gatewaysWithSensors);

      setGateways(gatewaysWithSensors as any);
      setUsingDummyData(false);
      setLoading(false);
    };

    fetchGateways();

    return () => {
      cancelled = true;
    };
  }, [clientData?.id]);

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">My Gateway</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Live connection status for your gateway and every sensor linked to it.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400 py-12 text-center">Checking device link status...</div>
      ) : gateways.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-10 text-center">
          <Radio className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No gateway has been registered to your account yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {usingDummyData && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/8 border border-amber-200 dark:border-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              Showing demo gateways — register a real gateway to see live data here.
            </div>
          )}
          {gateways.map((gw) => {
            const online = isOnline(gw.last_seen_at ?? undefined);
            return (
              <div
                key={gw.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Gateway header */}
                <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-850">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${online ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-slate-100 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800'}`}>
                      {online ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        {gw.name || `Gateway ${gw.id.slice(0, 8)}`}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {gw.name || 'Location not set'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${online ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {online ? 'ONLINE' : 'OFFLINE'}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      Last seen {timeAgo(gw.last_seen_at ?? undefined)}
                    </p>
                  </div>
                </div>

                {/* Connected sensors */}
                <div className="p-5">
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Connected Sensors ({gw.sensors?.length ?? 0})
                  </h5>
                  {!gw.sensors || gw.sensors.length === 0 ? (
                    <p className="text-xs text-slate-400">No sensors paired with this gateway yet.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {gw.sensors.map((sensor) => {
                        const sensing = sensingStates[sensor.id] ?? sensor.is_sensing ?? true;
                        return (
                          <div
                            key={sensor.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900"
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <Cpu className="w-4 h-4 text-slate-400 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                                  {sensor.message || sensor.rf_code || 'Sensor'}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">{timeAgo(sensor.timestamptz ?? sensor.last_triggered_at ?? undefined)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleSensing(sensor.id)}
                                className={`w-8 h-5 rounded-full transition-colors relative ${sensing ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                title={sensing ? 'Sensing ON — click to disable' : 'Sensing OFF — click to enable'}
                              >
                                <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${sensing ? 'left-4' : 'left-0.5'}`} />
                              </button>
                              <span className={`w-2 h-2 rounded-full shrink-0 ${sensing ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Devices;
