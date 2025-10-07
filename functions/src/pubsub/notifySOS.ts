import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import * as logger from 'firebase-functions/logger';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

import { SosEvent, UserProfile, EmergencyContact, NotificationLog } from '../../../src/types';
import { sendSosAlertEmail } from '../lib/emailClient';

const db = getFirestore();
const SOS_TRIGGERED_TOPIC = 'sos-triggered';

/**
 * A Pub/Sub-triggered function that orchestrates the notification cascade
 * when an SOS event is created.
 */
export const notifySOS = onMessagePublished(SOS_TRIGGERED_TOPIC, async (event) => {
  try {
    const { eventId } = event.data.message.json;
    if (!eventId || typeof eventId !== 'string') {
      logger.error('Invalid Pub/Sub message payload:', event.data.message.json);
      return;
    }

    logger.info(`Processing SOS event: ${eventId}`);

    // 1. Fetch the SOS event document
    const eventRef = db.collection('sos_events').doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
      logger.error(`SOS event document ${eventId} not found.`);
      return;
    }
    const sosEvent = eventDoc.data() as SosEvent;
    const { user_uid, location, created_at } = sosEvent;

    // 2. Fetch the user's profile to get their name
    const userProfileRef = db.collection('profiles').doc(user_uid);
    const userProfileDoc = await userProfileRef.get();
    if (!userProfileDoc.exists) {
      logger.error(`User profile ${user_uid} not found for SOS event ${eventId}.`);
      return;
    }
    const userProfile = userProfileDoc.data() as UserProfile;
    const userName = userProfile.name;

    // 3. Fetch the user's emergency contacts
    const contactsSnapshot = await db.collection('emergency_contacts')
      .where('user_uid', '==', user_uid)
      .get();

    if (contactsSnapshot.empty) {
      logger.warn(`No emergency contacts found for user ${user_uid}.`);
      return;
    }

    // 4. Iterate through contacts and send notifications
    const notificationPromises = contactsSnapshot.docs.map(async (contactDoc) => {
      const contact = contactDoc.data() as EmergencyContact;
      const contactId = contactDoc.id;

      // --- Tier 1: FCM Direct (To be implemented) ---
      // For now, we will log that it's skipped.

      // --- Tier 2: WebRTC (Out of scope for this step) ---

      // --- Tier 3: Email Fallback ---
      if (contact.email) {
        try {
          await sendSosAlertEmail(contact.email, {
            userName,
            location,
            timestamp: created_at,
          });
          await logNotification(eventId, contactId, 'email', 'sent');
        } catch (error) {
          await logNotification(eventId, contactId, 'email', 'failed', (error as Error).message);
        }
      }
    });

    await Promise.all(notificationPromises);
    logger.info(`Finished processing notifications for SOS event ${eventId}.`);

  } catch (error) {
    logger.error('Unhandled error in notifySOS function:', error);
  }
});

/**
 * Helper function to log the outcome of a notification attempt.
 */
async function logNotification(
  eventId: string,
  contactId: string,
  channel: 'fcm' | 'webrtc' | 'email',
  status: 'sent' | 'delivered' | 'failed',
  errorMessage?: string
) {
  const now = Timestamp.now();
  // 7 days in seconds (7 * 24 * 60 * 60)
  const expireAt = new Timestamp(now.seconds + 604800, now.nanoseconds);

  const logEntry: NotificationLog = {
    event_id: eventId,
    contact_id: contactId,
    channel,
    status,
    timestamp: now,
    expireAt: expireAt,
  };
  if (errorMessage) {
    logEntry.error_message = errorMessage;
  }
  // Add the log to the `notification_logs` collection
  await db.collection('notification_logs').add(logEntry);
}