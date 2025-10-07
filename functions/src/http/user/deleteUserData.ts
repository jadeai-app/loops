import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

// Initialize the Admin SDK if it's not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Creates a salted hash of a user's UID for anonymization purposes.
 * @param {string} uid The user's UID.
 * @returns {string} The salted hash.
 */
const createAnonymousId = (uid: string): string => {
  const salt = functions.config().auth.anonymization_salt;
  if (!salt) {
    throw new functions.https.HttpsError(
      'internal',
      'Anonymization salt is not configured. Cannot proceed with deletion.'
    );
  }
  return crypto.createHmac('sha256', salt).update(uid).digest('hex');
};

/**
 * An HTTP-callable function to delete all of a user's data in a GDPR-compliant manner.
 *
 * This function must be called by an authenticated user. It will:
 * 1. Delete their data from `profiles`, `user_limits`, and `push_subscriptions`.
 * 2. Anonymize their data in `sos_events` and `notification_logs`.
 * 3. Remove them from all `circle_members` subcollections.
 * 4. Delete their Firebase Auth user account.
 * 5. Create an audit log of the deletion.
 */
export const deleteUserData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to delete your account.'
    );
  }

  const uid = context.auth.uid;
  const anonymousId = createAnonymousId(uid);
  const batch = db.batch();

  try {
    // 1. Delete simple, user-keyed documents
    const profileRef = db.collection('profiles').doc(uid);
    batch.delete(profileRef);

    const limitsRef = db.collection('user_limits').doc(uid);
    batch.delete(limitsRef);

    const pushSubscriptionsQuery = db.collection('push_subscriptions').where('user_uid', '==', uid);
    const pushSubscriptionsSnapshot = await pushSubscriptionsQuery.get();
    pushSubscriptionsSnapshot.forEach(doc => batch.delete(doc.ref));

    // 2. Anonymize event and log data
    const sosEventsQuery = db.collection('sos_events').where('user_uid', '==', uid);
    const sosEventsSnapshot = await sosEventsQuery.get();
    sosEventsSnapshot.forEach(doc => {
      batch.update(doc.ref, { user_uid: anonymousId, original_uid_hash: anonymousId });
    });

    const notificationLogsQuery = db.collection('notification_logs').where('user_uid', '==', uid);
    const notificationLogsSnapshot = await notificationLogsQuery.get();
    notificationLogsSnapshot.forEach(doc => {
      batch.update(doc.ref, { user_uid: anonymousId, original_uid_hash: anonymousId });
    });

    // 3. Remove user from all circles they are a member of
    // Note: This assumes the 'circle_members' documents contain a 'member_uid' field.
    const circleMembershipQuery = db.collectionGroup('circle_members').where('member_uid', '==', uid);
    const circleMembershipSnapshot = await circleMembershipQuery.get();
    circleMembershipSnapshot.forEach(doc => batch.delete(doc.ref));

    // 4. Log the deletion event for auditing purposes
    const auditLogRef = db.collection('audit_logs').doc();
    batch.set(auditLogRef, {
      type: 'USER_DATA_DELETION',
      user_uid: uid,
      anonymous_id: anonymousId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'completed',
    });

    // Commit all the batched Firestore operations
    await batch.commit();

    // 5. Finally, delete the Firebase Auth user
    // This is done last so that if any of the above steps fail, the user can try again.
    await admin.auth().deleteUser(uid);

    return { status: 'success', message: 'User data deleted successfully.' };

  } catch (error) {
    functions.logger.error(`Failed to delete data for user ${uid}`, error);
    // Log the failure to the audit trail
    await db.collection('audit_logs').add({
        type: 'USER_DATA_DELETION',
        user_uid: uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'failed',
        error: (error as Error).message,
    });
    throw new functions.https.HttpsError('internal', 'Failed to delete user data.');
  }
});