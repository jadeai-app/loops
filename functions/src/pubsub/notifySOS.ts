import { pubsub, logger, config } from "firebase-functions/v2";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as sgMail from "@sendgrid/mail";

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

// Securely retrieve the SendGrid API key from Firebase environment configuration.
// To set this value, use the Firebase CLI:
// firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
const sendGridApiKey = config().sendgrid.key;
if (!sendGridApiKey) {
  logger.error(
    "SendGrid API key is not configured. " +
    "Set it with 'firebase functions:config:set sendgrid.key=\"YOUR_KEY\"'"
  );
} else {
  sgMail.setApiKey(sendGridApiKey);
  sgMail.setDataResidency("eu");
}

/**
 * Interface for the Pub/Sub message payload.
 */
interface SOSTriggeredEvent {
  eventId: string;
}

/**
 * A Pub/Sub-triggered function that sends notifications when an SOS is triggered.
 * This function follows the architecture specified in agents.md.
 */
export const notifySOS = pubsub.topic("sos-triggered").onMessage(async (message) => {
  try {
    const { eventId } = message.json as SOSTriggeredEvent;
    if (!eventId) {
      logger.error("Received Pub/Sub message without an eventId.");
      return;
    }
    logger.info(`Processing SOS event: ${eventId}`);

    // 1. Fetch the SOS event data from Firestore
    const eventSnap = await db.collection("sos_events").doc(eventId).get();
    if (!eventSnap.exists) {
      logger.error(`SOS event ${eventId} not found in Firestore.`);
      return;
    }
    const eventData = eventSnap.data();
    const userId = eventData?.user_uid;
    const circleId = eventData?.circle_id;

    if (!userId || !circleId) {
      logger.error(`Event ${eventId} is missing user_uid or circle_id.`);
      return;
    }

    // 2. Fetch the user's profile to get their name
    const userProfileSnap = await db.collection("profiles").doc(userId).get();
    const userName = userProfileSnap.data()?.name || "A Loops user";

    // 3. Fetch emergency contacts.
    // SCOPE NOTE: The logic below uses a hardcoded placeholder for emergency contacts.
    // The full implementation of contact fetching from the 'circles' and 'emergency_contacts'
    // collections, as described in agents.md, is a separate, more complex task
    // and is out of scope for this architectural fix.
    // TODO: Implement full circle member and emergency contact fetching logic.
    const contacts = [
      { email: "emergency-contact-placeholder@example.com", name: "Emergency Contact" },
    ];

    if (contacts.length === 0) {
        logger.info(`No emergency contacts found for user ${userId} in circle ${circleId}.`);
        return;
    }

    logger.info(`Found ${contacts.length} contact(s) for circle ${circleId}.`);

    // 4. Prepare and send email notifications via SendGrid
    const location = eventData?.location;
    const locationString = location ? `Lat: ${location.latitude}, Lon: ${location.longitude}` : "Not provided";
    const mapsLink = location ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}` : "No map available.";

    const msg = {
      to: contacts.map(c => c.email),
      from: {
          name: "Loops Safety",
          email: "sos@loops.app" // Use a verified sender on SendGrid
      },
      subject: `SOS Alert from ${userName}`,
      html: `
        <h1>Emergency SOS Alert</h1>
        <p><strong>${userName}</strong> has triggered an SOS alert.</p>
        <p><strong>Last Known Location:</strong> ${locationString}</p>
        <p><a href="${mapsLink}">View on Google Maps</a></p>
        <p>Please check on them immediately.</p>
        <p><em>This is an automated message from Loops. Do not reply to this email.</em></p>
      `,
    };

    await sgMail.send(msg);
    logger.info(`Successfully sent email notifications for event ${eventId}.`);

  } catch (error) {
    logger.error("Error processing SOS notification:", error);
    // In a production system, implement more robust error handling,
    // potentially with retries for transient errors.
  }
});