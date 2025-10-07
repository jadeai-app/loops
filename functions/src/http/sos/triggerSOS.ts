import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { getFirestore, Timestamp, GeoPoint } from "firebase-admin/firestore";
import { PubSub } from "@google-cloud/pubsub";

import { UserLimit, SosEvent, UserProfile } from "../../../../src/types";

// Initialize Firestore and Pub/Sub clients
const db = getFirestore();
const pubsub = new PubSub();
const sosTriggeredTopic = "sos-triggered";

interface TriggerSOSRequest {
  latitude: number;
  longitude: number;
  accuracy: number;
  // TODO: This should be derived from the user's circle settings
  circleId: string;
}

/**
 * A 2nd Gen HTTP Cloud Function to trigger an SOS event.
 *
 * - Requires authenticated user (valid Firebase ID token).
 * - Checks `user_limits` via Firestore transaction to enforce 3/hour SOS limit.
 * - Captures best-effort location from the client.
 * - Creates a new `sos_events` doc with `status: 'active'`.
 * - Immediately returns a success response.
 * - Publishes to Pub/Sub topic `sos-triggered` to decouple notification logic.
 */
export const triggerSOS = onCall<TriggerSOSRequest>(
  {
    enforceAppCheck: true, // Recommended for security
    consumeAppCheckToken: true,
  },
  async (request) => {
    // 1. Authentication Check
    if (!request.auth) {
      logger.warn("triggerSOS call from unauthenticated user.");
      throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }
    const uid = request.auth.uid;
    const { latitude, longitude, accuracy, circleId } = request.data;

    if (typeof latitude !== 'number' || typeof longitude !== 'number' || typeof accuracy !== 'number' || !circleId) {
        throw new HttpsError('invalid-argument', 'The function must be called with latitude, longitude, accuracy, and circleId.');
    }

    logger.info(`SOS trigger attempt by user: ${uid}`);

    try {
      // 2. Abuse Prevention (Rate Limiting & Remote Lock) via Firestore Transaction
      const userLimitRef = db.collection("user_limits").doc(uid);
      const userProfileRef = db.collection("profiles").doc(uid);
      const sosEventRef = db.collection("sos_events").doc(); // Create a new doc reference

      await db.runTransaction(async (transaction) => {
        const [limitDoc, profileDoc] = await transaction.getAll(userLimitRef, userProfileRef);
        const now = Timestamp.now();

        // Check for remote lock
        if (profileDoc.exists) {
          const profileData = profileDoc.data() as UserProfile;
          if (profileData.remote_lock_expires && profileData.remote_lock_expires > now) {
            logger.warn(`User ${uid} attempted SOS while remotely locked.`);
            throw new HttpsError(
              "failed-precondition",
              "Your account is temporarily locked by your safety circle."
            );
          }
        }

        // Check rate limits
        const oneHourAgo = Timestamp.fromMillis(now.toMillis() - 60 * 60 * 1000);
        let limitData: UserLimit;

        if (!limitDoc.exists) {
          // First time user is triggering SOS
          limitData = { sos_count: 1, last_sos_time: now };
        } else {
          const data = limitDoc.data() as UserLimit;
          // Reset count if the last SOS was more than an hour ago
          if (data.last_sos_time < oneHourAgo) {
            limitData = { sos_count: 1, last_sos_time: now };
          } else {
            // Check if the user has exceeded the limit
            if (data.sos_count >= 3) {
              logger.warn(`User ${uid} exceeded SOS limit.`);
              throw new HttpsError(
                "resource-exhausted",
                "You have exceeded the SOS limit. Please try again later."
              );
            }
            limitData = {
              sos_count: (data.sos_count || 0) + 1,
              last_sos_time: now,
            };
          }
        }

        // Update the user's limit document
        transaction.set(userLimitRef, limitData, { merge: true });

        // 3. Create the SOS Event Document
        const newSosEvent: SosEvent = {
            user_uid: uid,
            circle_id: circleId, // This needs to be determined from user's profile
            status: 'active',
            location: new GeoPoint(latitude, longitude),
            accuracy_meters: accuracy,
            trigger_method: 'hold', // Defaulting to 'hold' for now
            created_at: now,
        };
        transaction.set(sosEventRef, newSosEvent);
      });

      // 4. Publish to Pub/Sub (outside the transaction)
      await pubsub.topic(sosTriggeredTopic).publishMessage({
        json: { eventId: sosEventRef.id },
      });

      logger.info(`Successfully triggered SOS event ${sosEventRef.id} for user ${uid}`);

      // 5. Return success to the client
      return { status: "success", eventId: sosEventRef.id };

    } catch (error) {
      logger.error(`Error in triggerSOS for user ${uid}:`, error);
      if (error instanceof HttpsError) {
        throw error; // Re-throw HttpsError to be sent to the client
      }
      // For other errors, throw a generic internal error
      throw new HttpsError("internal", "An unexpected error occurred while triggering the SOS.");
    }
  }
);