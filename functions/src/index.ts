/**
 * Main entry point for all Cloud Functions.
 *
 * This file should export all the functions that are to be deployed.
 * The Firebase CLI will read this file to determine which functions to deploy.
 */

// --- Core SOS Functions ---
import { triggerSOS } from './http/sos/triggerSOS';
import { enforceAbuseControls } from './triggers/enforceAbuseControls';
import { notifySOS } from './pubsub/notifySOS';
import { onSosEventUpdate } from './triggers/onSosEventUpdate';

// --- User Lifecycle & Invitation Functions ---
import { onUserProfileCreate } from './triggers/onUserCreate';
import { sendCircleInvite } from './http/circles/sendInvite';

// Export all functions for deployment, grouped by feature
export {
  // SOS and Event Handling
  triggerSOS,
  enforceAbuseControls,
  notifySOS,
  onSosEventUpdate,

  // User Onboarding and Invitations
  onUserProfileCreate,
  sendCircleInvite,
};