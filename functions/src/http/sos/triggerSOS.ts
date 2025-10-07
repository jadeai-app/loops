import { https, logger } from "firebase-functions/v2";
import { db } from "../../lib/firebaseAdmin";
import { PubSub } from "@google-cloud/pubsub";
import { FieldValue } from "firebase-admin/firestore";

const pubSubClient = new PubSub();
const SOS_TRIGGERED_TOPIC = 'sos-triggered';

/**
 * A 2nd Gen HTTP Cloud Function to trigger an SOS alert.
 *
 * This function is the primary entry point for the SOS activation engine. It is responsible for:
 * 1. Authenticating the user via their Firebase Auth ID token.
 * 2. Fetching the user's circle to associate with the event.
 * 3. Creating a new SOS event document in Firestore.
 * 4. Publishing the event to a Pub/Sub topic for decoupled notification processing.
 *
 * Rate limiting is handled by the `enforceAbuseControls` trigger, not this function.
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

  // Check if the user is remotely locked
  const profileRef = db.collection('profiles').doc(uid);
  const profileDoc = await profileRef.get();
  if (profileDoc.exists) {
    const profileData = profileDoc.data();
    if (profileData?.remote_lock_expires && profileData.remote_lock_expires.toMillis() > Date.now()) {
      logger.warn(`SOS trigger blocked for locked user ${uid}.`);
      throw new https.HttpsError(
        'permission-denied',
        'Your account is temporarily locked.'
      );
    }
  }

  // Abuse control: Limit SOS triggers to 3 per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentSosEvents = await db.collection('sos_events')
    .where('user_uid', '==', uid)
    .where('created_at', '>=', oneHourAgo)
    .get();

  if (recentSosEvents.size >= 3) {
    logger.warn(`Abuse control triggered for user ${uid}.`);
    throw new https.HttpsError(
      'resource-exhausted',
      'You have exceeded the SOS limit. Please try again later.'
    );
  }

  // 2. Fetch the user's default circle
  const circlesRef = db.collection('circles').where('owner_uid', '==', uid).limit(1);
  const circleSnapshot = await circlesRef.get();

  if (circleSnapshot.empty) {
    logger.error(`User ${uid} has no circles and cannot trigger an SOS.`);
    throw new https.HttpsError(
      "failed-precondition",
      "You must create a circle before you can trigger an SOS."
    );
  }
  const circleId = circleSnapshot.docs[0].id;


  // 3. Create the SOS event in Firestore
  const eventData = {
    user_uid: uid,
    circle_id: circleId,
    status: "active",
    location: request.data.location || null, // Expecting GeoPoint data from the client
    accuracy_meters: request.data.accuracy_meters || null,
    trigger_method: "hold", // TODO: Determine from client data
    created_at: FieldValue.serverTimestamp(),
  };

  const eventRef = await db.collection("sos_events").add(eventData);
  logger.info(`SOS event ${eventRef.id} created for user ${uid}.`);

  // 4. Publish to Pub/Sub for notification processing
  try {
    const messageId = await pubSubClient.topic(SOS_TRIGGERED_TOPIC).publishJSON({ eventId: eventRef.id });
    logger.info(`Event ${eventRef.id} published to ${SOS_TRIGGERED_TOPIC} with message ID ${messageId}.`);
  } catch (error) {
    logger.error(`Failed to publish event ${eventRef.id} to Pub/Sub.`, { error });
    // Continue execution, but log the error. The system should be resilient to this.
  }

  // 5. Return a success response to the client
  return {
    success: true,
    eventId: eventRef.id,
    message: "SOS successfully triggered. Help is on the way.",
  };
});
