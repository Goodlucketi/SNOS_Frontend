export interface User {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  role?: 'user' | 'admin' | 'super_admin';
}

export type AlertStatus = 'unread' | 'read' | 'in-progress' | 'resolved' | 'completed' | 'complete';

export type EventSource = 'rf' | 'camera';

export interface BaseAlert {
  id: string;
  client_id: string;
  occurred_at: string;
  status: AlertStatus;
  source: EventSource;
}

export interface RfAlert extends BaseAlert {
  source: 'rf';
  sensor_id: string;
  code?: string;
  message: string;
  media_url?: string;
}

export interface CameraAlert extends BaseAlert {
  source: 'camera';
  gateway_id: string;
  camera_id: string | null;
  camera_key: string;
  home_id: string;
  label: string;
  zone: string;
  score: number;
  started_at: string;
  ended_at: string | null;
  thumbnail_ref: string | null;
  clip_ref: string | null;
  message: string; // Derived from label/zone for display
  media_url?: string; // thumbnail_ref or clip_ref
}

export type Alert = RfAlert | CameraAlert;
