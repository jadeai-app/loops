import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * An HTTP-callable function to add a WebRTC answer to an existing offer.
 *
 * This function must be called by an authenticated user. It will:
 * 1. Validate the request data.
 * 2. Verify the user is the intended recipient of the offer.
 * 3. Update the signal document in Firestore with the answer.
 */
export const webrtcAnswer = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to send a WebRTC answer.'
    );
  }

  const { signalId, answer } = data;
  const recipientId = context.auth.uid;

  if (!signalId || !answer) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with "signalId" and "answer" arguments.'
    );
  }

  const signalRef = db.collection('webrtc_signals').doc(signalId);

  try {
    const signalDoc = await signalRef.get();

    if (!signalDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'The specified signal offer does not exist.');
    }

    const signalData = signalDoc.data();

    // Security Check: Ensure the user providing the answer is the intended recipient.
    if (signalData?.recipientId !== recipientId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You are not the intended recipient of this WebRTC offer.'
      );
    }

    // Update the document with the answer.
    await signalRef.update({
      answer,
      answeredAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { status: 'success' };

  } catch (error) {
    // Re-throw HttpsError to be sent to the client
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    functions.logger.error(`Failed to add WebRTC answer for signal ${signalId}`, error);
    throw new functions.https.HttpsError('internal', 'Failed to add WebRTC answer.');
  }
});