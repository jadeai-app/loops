import { https, logger } from 'firebase-functions/v2';
import { db } from '../../lib/firebaseAdmin';

/**
 * A callable Cloud Function to create a user's first circle during onboarding.
 */
export const createFirstCircle = https.onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    logger.error('Create circle attempt by unauthenticated user.');
    throw new https.HttpsError(
      'unauthenticated',
      'You must be logged in to create a circle.'
    );
  }

  const { circleName } = request.data;
  if (!circleName || typeof circleName !== 'string' || circleName.length === 0) {
    throw new https.HttpsError(
      'invalid-argument',
      'A valid circle name must be provided.'
    );
  }

  logger.info(`User ${uid} is creating their first circle named: ${circleName}`);

  try {
    const circleRef = await db.collection('circles').add({
      name: circleName,
      owner_uid: uid,
      members: [uid], // The creator is the first member
      created_at: new Date(),
    });

    logger.info(`Successfully created circle ${circleRef.id} for user ${uid}`);

    return {
      success: true,
      circleId: circleRef.id,
    };
  } catch (error) {
    logger.error(`Failed to create circle for user: ${uid}`, { error });
    throw new https.HttpsError(
      'internal',
      'An unexpected error occurred while creating your circle.'
    );
  }
});