import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { getFirestore } from 'firebase-admin/firestore';
import { sendSosResolutionEmail } from '../lib/emailClient';
import { SosEvent, EmergencyContact, UserProfile } from '../../../src/types';

const db = getFirestore();
const SOS_EVENTS_COLLECTION = 'sos_events/{eventId}';

/**
 * A Cloud Function that triggers when an SOS event is updated.
 * If the status is changed to 'resolved', it sends a resolution email.
 */
export const onSosEventUpdate = onDocumentUpdated(SOS_EVENTS_COLLECTION, async (event) => {
  try {
    const before = event.data?.before.data() as SosEvent | undefined;
    const after = event.data?.after.data() as SosEvent | undefined;

    if (!before || !after) {
      logger.error('Event data is missing.');
      return;
    }

    // Check if the status has changed to 'resolved'
    if (before.status !== 'resolved' && after.status === 'resolved') {
      const { user_uid, created_at, resolved_at, resolution_reason } = after;
      const eventId = event.params.eventId;

      logger.info(`SOS event ${eventId} has been resolved. Sending resolution emails.`);

      // 1. Fetch user's name
      const userProfileDoc = await db.collection('profiles').doc(user_uid).get();
      if (!userProfileDoc.exists) {
        logger.error(`User profile ${user_uid} not found for resolved SOS event ${eventId}.`);
        return;
      }
      const userName = (userProfileDoc.data() as UserProfile).name;

      // 2. Fetch emergency contacts
      const contactsSnapshot = await db.collection('emergency_contacts').where('user_uid', '==', user_uid).get();
      if (contactsSnapshot.empty) {
        logger.warn(`No emergency contacts found for user ${user_uid} to notify of resolution.`);
        return;
      }

      // 3. Prepare email data
      const emailData = {
        userName,
        eventTime: created_at.toDate().toLocaleString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }),
        resolutionTime: (resolved_at || new Date()).toLocaleString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }),
        resolutionReason: resolution_reason || 'No reason provided',
      };

      // 4. Send resolution email to all contacts
      const resolutionPromises = contactsSnapshot.docs.map(doc => {
        const contact = doc.data() as EmergencyContact;
        if (contact.email) {
          return sendSosResolutionEmail(contact.email, emailData);
        }
        return Promise.resolve();
      });

      await Promise.all(resolutionPromises);
      logger.info(`Finished sending resolution emails for SOS event ${eventId}.`);
    }
  } catch (error) {
    logger.error(`Error handling SOS event update for event ${event.params.eventId}`, error);
  }
});