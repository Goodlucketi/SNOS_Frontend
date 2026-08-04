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
  event_id: string; // Camera event ID for fetching media from boscotec.org
  message: string; // Derived from label/zone for display
  media_url?: string; // thumbnail or clip URL from boscotec.org
  media_type?: 'image' | 'video'; // Type of media for proper rendering
}

export type Alert = RfAlert | CameraAlert;
