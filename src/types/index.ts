import { Timestamp, GeoPoint } from "firebase/firestore";

/**
 * Represents the user's profile document in Firestore.
 * Path: /profiles/{uid}
 */
export interface Profile {
  name: string;
  email: string;
  phone?: string; // E.164 format
  security_settings: {
    mfa_enabled: boolean;
  };
  pwa_installed: boolean;
  remote_lock_expires?: Timestamp;
}

/**
 * Represents a Safety Circle.
 * Path: /circles/{circle_id}
 */
export interface Circle {
  owner_uid: string;
  name: string;
  created_at: Timestamp;
}

/**
 * Represents a member within a circle's subcollection.
 * Path: /circles/{circle_id}/members/{member_uid}
 */
export interface CircleMember {
  joined_at: Timestamp;
  status: 'active' | 'invited';
}

/**
 * Represents an emergency contact for a user.
 * Path: /emergency_contacts/{contact_id}
 */
export interface EmergencyContact {
  user_uid: string;
  name: string;
  phone?: string; // E.164 format
  email?: string;
  fcm_token?: string;
  priority_tier: 1 | 2 | 3;
}

/**
 * Represents an SOS event.
 * Path: /sos_events/{event_id}
 */
export interface SosEvent {
  user_uid: string;
  circle_id: string;
  status: 'active' | 'resolved';
  location: GeoPoint;
  accuracy_meters: number;
  trigger_method: 'hold' | 'shake' | 'voice';
  created_at: Timestamp;
  resolved_at?: Timestamp;
  resolution_reason?: 'false_alarm' | 'all_ok' | 'emergency_handled';
}

/**
 * Represents a push notification subscription for a user's device.
 * Path: /push_subscriptions/{subId}
 */
export interface PushSubscription {
  user_uid: string;
  fcm_token: string;
  platform: 'web' | 'ios' | 'android';
  created_at: Timestamp;
  last_seen: Timestamp;
}

/**
 * Represents the rate-limiting and abuse prevention data for a user.
 * Path: /user_limits/{user_uid}
 */
export interface UserLimits {
  sos_count: number;
  last_sos_time: Timestamp;
  cooldown_expires?: Timestamp;
}

/**
 * Represents a log of a notification sent during an SOS event.
 * Path: /notification_logs/{log_id}
 */
export interface NotificationLog {
  event_id: string;
  contact_id: string;
  channel: 'fcm' | 'webrtc' | 'email';
  status: 'sent' | 'delivered' | 'failed';
  timestamp: Timestamp;
  error_message?: string;
}