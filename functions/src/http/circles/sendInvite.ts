import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { sendCircleInviteEmail } from '../../lib/emailClient';

interface SendInviteData {
  inviteeEmail: string;
  inviterName: string;
}

/**
 * A callable Cloud Function to send a circle invitation email.
 * This should be called by an authenticated user from the client app.
 */
export const sendCircleInvite = onCall<SendInviteData>(async (request) => {
  // 1. Check for authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { inviteeEmail, inviterName } = request.data;

  // 2. Validate the input data
  if (!inviteeEmail || !inviterName) {
    throw new HttpsError('invalid-argument', 'The function must be called with "inviteeEmail" and "inviterName" arguments.');
  }

  logger.info(`Processing invitation from ${inviterName} (${request.auth.uid}) to ${inviteeEmail}.`);

  try {
    // 3. Generate a unique invitation link (the frontend will handle the token)
    // In a real app, you would generate a unique token, store it, and create a link.
    // For this implementation, we'll use a placeholder link.
    const inviteLink = `${process.env.APP_URL || 'https://loops.app'}/join?email=${encodeURIComponent(inviteeEmail)}`;

    // 4. Send the invitation email
    await sendCircleInviteEmail(inviteeEmail, {
      inviterName,
      inviteLink,
    });

    logger.info(`Circle invitation email successfully queued for ${inviteeEmail}.`);

    return { success: true, message: 'Invitation sent successfully.' };

  } catch (error) {
    logger.error('Failed to send circle invitation email.', error);
    throw new HttpsError('internal', 'An unexpected error occurred while sending the invitation.');
  }
});