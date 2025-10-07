import type { GeoPoint, Timestamp } from 'firebase/firestore';

/**
 * Represents the public profile of a user.
 * Stored in the `profiles` collection.
 */
export interface UserProfile {
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
 * Represents a user's safety circle.
 * Stored in the `circles` collection.
 */
export interface Circle {
  owner_uid: string;
  name: string;
  created_at: Timestamp;
}

/**
 * Represents a member within a circle's subcollection.
 * Stored in the `circles/{circle_id}/members` subcollection.
 */
export interface CircleMember {
  joined_at: Timestamp;
  status: 'active' | 'invited';
}

/**
 * Represents an emergency contact for a user.
 * Stored in the `emergency_contacts` collection.
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
 * Represents an SOS event triggered by a user.
 * Stored in the `sos_events` collection.
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
 * Represents a push subscription for a user's device.
 * Stored in the `push_subscriptions` collection.
 */
export interface PushSubscription {
  user_uid: string;
  fcm_token: string;
  platform: 'web' | 'ios' | 'android';
  created_at: Timestamp;
  last_seen: Timestamp;
}

/**
 * Tracks a user's SOS usage limits for abuse prevention.
 * Stored in the `user_limits` collection.
 */
export interface UserLimit {
  sos_count: number;
  last_sos_time: Timestamp;
  cooldown_expires?: Timestamp;
}

/**
 * Logs the status of each notification sent for an SOS event.
 * Stored in the `notification_logs` collection.
 */
export interface NotificationLog {
  event_id: string;
  contact_id: string;
  channel: 'fcm' | 'webrtc' | 'email';
  status: 'sent' | 'delivered' | 'failed';
  timestamp: Timestamp;
  error_message?: string;
}