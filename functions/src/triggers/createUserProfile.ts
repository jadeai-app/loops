import { onNewUser, UserRecord } from 'firebase-functions/v2/auth';
import * as logger from 'firebase-functions/logger';
import { db } from '../lib/firebaseAdmin';

/**
 * The core logic for creating a user profile. Exported for testing.
 * @param {UserRecord} user The user object from Firebase Auth.
 */
export const userProfileCreationHandler = async (user: UserRecord) => {
  logger.info(`Creating profile for new user: ${user.uid}`);

  const { uid, email } = user;

  const profileData = {
    email,
    onboardingComplete: false,
    createdAt: new Date(),
  };

  try {
    await db.collection('profiles').doc(uid).set(profileData);
    logger.info(`Successfully created profile for user: ${uid}`);
  } catch (error) {
    logger.error(`Failed to create profile for user: ${uid}`, { error });
  }
};

/**
 * A Cloud Function that triggers when a new Firebase user is created.
 *
 * This function creates a corresponding user profile document in Firestore
 * to store additional user data and track their onboarding status.
 */
export const createUserProfile = onNewUser(userProfileCreationHandler);