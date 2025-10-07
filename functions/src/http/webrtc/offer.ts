import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Checks if two users are in the same safety circle.
 * @param {string} senderId The UID of the user sending the offer.
 * @param {string} recipientId The UID of the user receiving the offer.
 * @returns {Promise<boolean>} True if they share a circle, false otherwise.
 */
const areInSameCircle = async (senderId: string, recipientId: string): Promise<boolean> => {
    // Find all circles the sender is a member of
    const senderCirclesSnapshot = await db.collectionGroup('circle_members')
        .where('member_uid', '==', senderId)
        .get();

    if (senderCirclesSnapshot.empty) {
        return false;
    }

    // For each circle the sender is in, check if the recipient is also a member
    for (const doc of senderCirclesSnapshot.docs) {
        const circleId = doc.ref.parent.parent?.id;
        if (circleId) {
            const recipientInCircleRef = db.collection('circles').doc(circleId).collection('members').doc(recipientId);
            const recipientDoc = await recipientInCircleRef.get();
            if (recipientDoc.exists) {
                return true; // Found a shared circle
            }
        }
    }

    return false;
};

/**
 * An HTTP-callable function to create and store a WebRTC offer.
 *
 * This function must be called by an authenticated user. It will:
 * 1. Validate the request data.
 * 2. Verify the recipient is in the sender's safety circle.
 * 3. Store the offer in Firestore with a server-side timestamp for TTL.
 */
export const webrtcOffer = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to send a WebRTC offer.'
    );
  }

  const { recipientId, offer } = data;
  const senderId = context.auth.uid;

  if (!recipientId || !offer) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with "recipientId" and "offer" arguments.'
    );
  }

  // Security Check: Ensure sender and receiver are in the same circle
  const inSameCircle = await areInSameCircle(senderId, recipientId);
  if (!inSameCircle) {
      throw new functions.https.HttpsError(
          'permission-denied',
          'You can only send offers to members of your safety circle.'
      );
  }

  try {
    // Store the offer in the `webrtc_signals` collection.
    // The TTL policy will automatically delete this document after 5 minutes.
    const now = admin.firestore.Timestamp.now();
    const expireAt = admin.firestore.Timestamp.fromMillis(now.toMillis() + 5 * 60 * 1000); // 5 minutes from now

    const signalRef = db.collection('webrtc_signals').doc();
    await signalRef.set({
      senderId,
      recipientId,
      offer,
      createdAt: now,
      expireAt: expireAt,
    });

    return { status: 'success', signalId: signalRef.id };

  } catch (error) {
    functions.logger.error(`Failed to create WebRTC offer for user ${senderId}`, error);
    throw new functions.https.HttpsError('internal', 'Failed to create WebRTC offer.');
  }
});