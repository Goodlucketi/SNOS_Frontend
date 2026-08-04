import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, MapPin, Cpu, Cctv } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { getCamerasByGateway, Camera } from '../lib/api';
import { toast } from 'react-toastify';
import { formatDateGMT1, formatTimeGMT1 } from '../lib/timezone';

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
  cameras?: Camera[];
}

// A node (gateway or sensor) counts as "online" if it's checked in within this window.
const ONLINE_THRESHOLD_MINUTES = 10;

const isOnline = (lastSeen?: string) => {
  if (!lastSeen) return false;
  const diffMs = Date.now() - new Date(lastSeen).getTime();
  return diffMs < ONLINE_THRESHOLD_MINUTES * 60 * 1000;
};

const Devices: React.FC = () => {
  const { clientData } = useAuth();
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);

  // Track sensing toggle state per sensor (keyed by sensor.id).
  // Initialised from the gateway/sensor data once it loads.
  const [sensingStates, setSensingStates] = useState<Record<string, boolean>>({});

  // Track enabled toggle state per camera (keyed by camera.id).
  const [cameraEnabledStates, setCameraEnabledStates] = useState<Record<string, boolean>>({});

  const toggleSensing = async (sensorId: string, currentState: boolean) => {
    const newState = !currentState;
    setSensingStates(prev => ({ ...prev, [sensorId]: newState }));

    try {
      const { error } = await supabase
        .from('rf_sensors')
        .update({ is_sensing: newState })
        .eq('id', sensorId);

      if (error) {
        console.error('Error toggling sensor:', error);
        // Revert on error
        setSensingStates(prev => ({ ...prev, [sensorId]: currentState }));
        toast.error('Failed to update sensor');
      } else {
        toast.success(newState ? 'Sensing enabled' : 'Sensing disabled');
      }
    } catch (err) {
      console.error('Error toggling sensor:', err);
      setSensingStates(prev => ({ ...prev, [sensorId]: currentState }));
      toast.error('Failed to update sensor');
    }
  };

  const toggleCameraEnabled = async (cameraId: string, currentState: boolean) => {
    const newState = !currentState;
    setCameraEnabledStates(prev => ({ ...prev, [cameraId]: newState }));

    try {
      const { error } = await supabase
        .from('cameras')
        .update({ is_enabled: newState })
        .eq('id', cameraId);

      if (error) {
        console.error('Error toggling camera:', error);
        // Revert on error
        setCameraEnabledStates(prev => ({ ...prev, [cameraId]: currentState }));
        toast.error('Failed to update camera');
      } else {
        toast.success(newState ? 'Camera enabled' : 'Camera disabled');
      }
    } catch (err) {
      console.error('Error toggling camera:', err);
      setCameraEnabledStates(prev => ({ ...prev, [cameraId]: currentState }));
      toast.error('Failed to update camera');
    }
  };

  // Seed sensingStates whenever gateways change (real or dummy).
  useEffect(() => {
    const states: Record<string, boolean> = {};
    const camStates: Record<string, boolean> = {};
    gateways.forEach(gw => {
      gw.sensors?.forEach(s => {
        states[s.id] = s.is_sensing ?? true;
      });
      gw.cameras?.forEach(c => {
        camStates[c.id] = c.is_enabled ?? true;
      });
    });
    setSensingStates(states);
    setCameraEnabledStates(camStates);
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
          setGateways([]);
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
        setGateways([]);
        setLoading(false);
        return;
      }

      console.log('Gateways found:', gatewaysData?.length, gatewaysData);

      if (!gatewaysData || gatewaysData.length === 0) {
        console.log('No gateways for client');
        setGateways([]);
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

      // Fetch cameras for all gateways using the API
      console.log('Fetching cameras for gateway IDs:', gatewayIds);
      const camerasByGateway: Record<string, Camera[]> = {};
      try {
        // Fetch cameras for each gateway in parallel
        const cameraPromises = gatewayIds.map(gatewayId =>
          getCamerasByGateway(gatewayId).then(cameras => ({ gatewayId, cameras }))
        );
        const cameraResults = await Promise.all(cameraPromises);
        cameraResults.forEach(({ gatewayId, cameras }) => {
          if (cameras && cameras.length > 0) {
            camerasByGateway[gatewayId] = cameras;
          }
        });
        console.log('Cameras found:', camerasByGateway);
      } catch (cameraError) {
        console.error('Error fetching cameras:', cameraError);
      }

      if (cancelled) return;

      // Group sensors by gateway_id
      const sensorsByGateway = (sensorsData || []).reduce((acc, sensor) => {
        if (!acc[sensor.gateway_id]) {
          acc[sensor.gateway_id] = [];
        }
        acc[sensor.gateway_id].push(sensor);
        return acc;
      }, {} as Record<string, Sensor[]>);

      // Combine gateways with their sensors and cameras
      const gatewaysWithSensors = gatewaysData.map(gateway => ({
        ...gateway,
        sensors: sensorsByGateway[gateway.id] || [],
        cameras: camerasByGateway[gateway.id] || []
      }));

      console.log('Final gateways with sensors and cameras:', gatewaysWithSensors);

      setGateways(gatewaysWithSensors as any);
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
          <Cpu className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No gateway has been registered to your account yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
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
                      Last seen {formatDateGMT1(gw.last_seen_at ?? new Date().toISOString())} {formatTimeGMT1(gw.last_seen_at ?? new Date().toISOString())}
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
                                <p className="text-[10px] text-slate-400 font-mono">{formatDateGMT1(sensor.timestamptz ?? sensor.last_triggered_at ?? new Date().toISOString())} {formatTimeGMT1(sensor.timestamptz ?? sensor.last_triggered_at ?? new Date().toISOString())}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleSensing(sensor.id, sensing)}
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

                  {/* Connected cameras */}
                  {gw.cameras && gw.cameras.length > 0 && (
                    <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-850">
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Connected Cameras ({gw.cameras.length})
                      </h5>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {gw.cameras.map((camera) => {
                          const camEnabled = cameraEnabledStates[camera.id] ?? camera.is_enabled ?? true;
                          const camOnline = camEnabled && camera.status === 'connected';
                          return (
                            <div
                              key={camera.id}
                              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900"
                            >
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <Cctv className="w-4 h-4 text-blue-500 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                                    {camera.name || `Camera ${camera.camera_key}`}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    {camera.status} • {camOnline ? 'Enabled' : 'Disabled'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => toggleCameraEnabled(camera.id, camEnabled)}
                                  className={`w-8 h-5 rounded-full transition-colors relative ${camEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                  title={camEnabled ? 'Camera ON — click to disable' : 'Camera OFF — click to enable'}
                                >
                                  <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${camEnabled ? 'left-4' : 'left-0.5'}`} />
                                </button>
                                <span className={`w-2 h-2 rounded-full shrink-0 ${camOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
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
