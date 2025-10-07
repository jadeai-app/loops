import * as sgMail from '@sendgrid/mail';
import * as logger from 'firebase-functions/logger';
import type { GeoPoint, Timestamp } from 'firebase-admin/firestore';

// Set the SendGrid API key. This should be stored as a secret in your environment.
// For Firebase Functions, you can use `firebase functions:secrets:set SENDGRID_API_KEY`
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  logger.warn('SENDGRID_API_KEY is not set. Email notifications will be disabled.');
}

interface EmergencyEmailData {
  to: string;
  from: string; // e.g., "no-reply@loops.app"
  userName: string;
  location: GeoPoint;
  timestamp: Timestamp;
}

/**
 * Sends a plain-text emergency email using SendGrid.
 *
 * @param {EmergencyEmailData} data The data for the emergency email.
 */
export const sendEmergencyEmail = async (data: EmergencyEmailData) => {
  if (!process.env.SENDGRID_API_KEY) {
    logger.error('Cannot send email because SENDGRID_API_KEY is not configured.');
    return;
  }

  const { to, from, userName, location, timestamp } = data;

  // Create a static Google Maps link for the location
  const mapLink = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;

  // Format the timestamp for readability
  const eventTime = timestamp.toDate().toLocaleString('en-US', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });

  const msg = {
    to,
    from,
    subject: `URGENT: ${userName} has triggered an SOS`,
    text: `
      URGENT: An SOS alert has been triggered by ${userName}.

      ---
      Event Details
      ---
      - User: ${userName}
      - Time of Alert (UTC): ${eventTime}
      - Last Known Location: ${mapLink}

      ---
      What to do
      ---
      1. Attempt to contact ${userName} immediately.
      2. Check the Loops application for real-time updates on their status.
      3. If you cannot make contact and believe this is a real emergency, please consider contacting emergency services.

      To resolve this alert or see more details, please open the Loops application.

      Thank you,
      The Loops Team
    `,
  };

  try {
    await sgMail.send(msg);
    logger.info(`Emergency email sent successfully to ${to} for user ${userName}`);
  } catch (error) {
    logger.error(`Failed to send emergency email to ${to}`, error);
    // Depending on the error, you might want to handle it further
  }
};