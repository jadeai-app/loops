import { firestore } from 'firebase-functions/v2';
import { logger } from 'firebase-functions';
import { db } from '../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import type { SosEvent, UserLimit } from '../../../src/types';

const ABUSE_LIMIT_COUNT = 3; // Max 3 SOS events
const ABUSE_LIMIT_HOURS = 1; // within 1 hour

/**
 * A Firestore trigger that enforces abuse controls for SOS activations.
 *
 * This function is triggered whenever a new `sos_events` document is created.
 * It checks the user's activation history in the `user_limits` collection
 * and cancels the SOS if the rate limit has been exceeded.
 */
export const enforceAbuseControls = firestore.onDocumentCreated(
  'sos_events/{eventId}',
  async (event) => {
    const snap = event.data;
    if (!snap) {
      logger.error('No data associated with the event', { eventId: event.params.eventId });
      return;
    }

    const sosData = snap.data() as SosEvent;
    const { user_uid } = sosData;

    const userLimitRef = db.collection('user_limits').doc(user_uid);

    try {
      await db.runTransaction(async (transaction) => {
        const userLimitDoc = await transaction.get(userLimitRef);

        if (!userLimitDoc.exists) {
          // First time user is triggering SOS, create a new limit document.
          transaction.create(userLimitRef, {
            sos_count: 1,
            last_sos_time: FieldValue.serverTimestamp(),
          });
          logger.info(`First SOS for user ${user_uid}. Creating limit document.`);
          return;
        }

        const limits = userLimitDoc.data() as UserLimit;
        const { sos_count, last_sos_time } = limits;

        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - ABUSE_LIMIT_HOURS);

        // Check if the last SOS was within the cool-down period.
        if (sos_count >= ABUSE_LIMIT_COUNT && last_sos_time.toDate() > oneHourAgo) {
          logger.warn(`Abuse detected for user ${user_uid}. Deleting SOS event.`, {
            eventId: snap.id,
          });
          // If limit is exceeded, delete the SOS event to cancel it.
          await snap.ref.delete();
          // Optionally, you could set a cooldown period for the user here.
          return;
        }

        // If the last SOS was more than an hour ago, reset the count.
        if (last_sos_time.toDate() < oneHourAgo) {
          transaction.update(userLimitRef, {
            sos_count: 1,
            last_sos_time: FieldValue.serverTimestamp(),
          });
          logger.info(`Resetting SOS count for user ${user_uid}.`);
        } else {
          // Otherwise, just increment the count.
          transaction.update(userLimitRef, {
            sos_count: FieldValue.increment(1),
            last_sos_time: FieldValue.serverTimestamp(),
          });
          logger.info(`Incrementing SOS count for user ${user_uid}.`);
        }
      });
    } catch (error) {
      logger.error('Transaction failed for abuse controls', {
        error,
        userId: user_uid,
      });
    }
  }
);