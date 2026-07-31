export interface User {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  address?: string;
  role?: 'user' | 'admin' | 'super_admin';
}

export type AlertStatus = 'unread' | 'in-progress' | 'completed' | 'complete';

export interface Alert {
  id: string;
  sensor_id: string;
  client_id: string;
  code?: string;
  message: string;
  occurred_at: string;
  media_url?: string;
  status: AlertStatus;
}
