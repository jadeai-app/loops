import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { sendWelcomeEmail } from '../lib/emailClient';
import { UserProfile } from '../../../src/types';

const PROFILES_COLLECTION = 'profiles/{userId}';

/**
 * A Cloud Function that triggers when a new user profile is created.
 * It sends a welcome email to the new user.
 */
export const onUserProfileCreate = onDocumentCreated(PROFILES_COLLECTION, async (event) => {
  try {
    const snapshot = event.data;
    if (!snapshot) {
      logger.error('No data associated with the event');
      return;
    }

    const newUser = snapshot.data() as UserProfile;
    const { email, name } = newUser;

    if (!email || !name) {
      logger.error('New user document is missing email or name.', { userId: snapshot.id });
      return;
    }

    logger.info(`New user profile created for ${name} (${email}). Sending welcome email.`);

    await sendWelcomeEmail(email, { userName: name });

    logger.info(`Welcome email successfully queued for ${email}.`);

  } catch (error) {
    logger.error('Failed to send welcome email.', error);
  }
});