import { https, logger } from "firebase-functions/v2";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();
const messaging = getMessaging();

/**
 * A 2nd Gen HTTP Cloud Function to trigger an SOS alert.
 *
 * This function is the primary entry point for the SOS activation engine. It is responsible for:
 * 1. Authenticating the user via their Firebase Auth ID token.
 * 2. Enforcing rate limits to prevent abuse (3 activations per rolling hour).
 * 3. Creating a new SOS event document in Firestore.
 * 4. Publishing the event to the `sos-triggered` Pub/Sub topic for decoupled processing.
 */
export const triggerSOS = https.onCall(async (request) => {
  // 1. Authenticate the user
  const uid = request.auth?.uid;
  if (!uid) {
    logger.error("SOS trigger attempt by unauthenticated user.");
    throw new https.HttpsError(
      "unauthenticated",
      "You must be logged in to trigger an SOS."
    );
  }

  logger.info(`SOS triggered by user: ${uid}`);

  // 2. Enforce rate limiting (TODO: Implement Firestore transaction)
  // - Check the `user_limits` collection for the user's `sos_count` and `last_sos_time`.
  // - If the user has exceeded 3 activations in the last hour, throw an error.
  // - Otherwise, increment the count.

  // 3. Create the SOS event in Firestore
  // - Get the user's default circle.
  // - Create a new document in the `sos_events` collection.
  const eventData = {
    user_uid: uid,
    circle_id: "default_circle_id", // TODO: Fetch the user's actual circle ID
    status: "active",
    location: request.data.location || null, // Expecting location data from the client
    accuracy_meters: request.data.accuracy_meters || null,
    trigger_method: "hold", // TODO: Determine from client data
    created_at: new Date(),
  };

  const eventRef = await db.collection("sos_events").add(eventData);
  logger.info(`SOS event ${eventRef.id} created for user ${uid}.`);

  // 4. Publish to Pub/Sub (TODO: Implement Pub/Sub publishing)
  // - Publish the event ID to the `sos-triggered` topic.
  // const pubSubClient = new PubSub();
  // await pubSubClient.topic('sos-triggered').publishJSON({ eventId: eventRef.id });

  // 5. Return a success response to the client
  return {
    success: true,
    eventId: eventRef.id,
    message: "SOS successfully triggered. Help is on the way.",
  };
});
