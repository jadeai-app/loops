import { https, logger } from "firebase-functions/v2";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();

interface UserLimits {
    sos_count: number;
    last_sos_time: FirebaseFirestore.Timestamp;
    cooldown_expires?: FirebaseFirestore.Timestamp;
}

export const triggerSOS = https.onCall(async (request) => {
    // 1. Authentication
    if (!request.auth) {
        throw new https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const uid = request.auth.uid;

    // 2. Rate Limiting Logic
    const userLimitsRef = db.collection("user_limits").doc(uid);

    try {
        await db.runTransaction(async (transaction) => {
            const userLimitsDoc = await transaction.get(userLimitsRef);
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

            let sosCount = 0;

            if (userLimitsDoc.exists) {
                const data = userLimitsDoc.data() as UserLimits;

                // Check if user is in a cooldown period
                if (data.cooldown_expires && data.cooldown_expires.toDate() > now) {
                    const cooldownMinutes = Math.ceil((data.cooldown_expires.toDate().getTime() - now.getTime()) / 60000);
                    throw new https.HttpsError("resource-exhausted", `You are in a cooldown period. Please try again in ${cooldownMinutes} minutes.`);
                }

                // Reset count if the last SOS was more than an hour ago
                if (data.last_sos_time.toDate() < oneHourAgo) {
                    sosCount = 1;
                } else {
                    sosCount = data.sos_count + 1;
                }
            } else {
                sosCount = 1;
            }

            if (sosCount > 3) {
                // Enforce a 1-hour cooldown
                const cooldownExpires = new Date(now.getTime() + 60 * 60 * 1000);
                transaction.set(userLimitsRef, {
                    sos_count: sosCount,
                    last_sos_time: now,
                    cooldown_expires: cooldownExpires
                }, { merge: true });
                throw new https.HttpsError("resource-exhausted", "You have exceeded the SOS limit. Please try again in one hour.");
            }

            // Update the user's limits
            transaction.set(userLimitsRef, {
                sos_count: sosCount,
                last_sos_time: now
            }, { merge: true });
        });

        // 3. Create SOS Event (Simplified for now)
        // This would create a document in 'sos_events' and publish to Pub/Sub
        logger.info(`SOS triggered for user ${uid}.`);

        // 4. Return success response
        return { status: "success", message: "SOS triggered successfully." };

    } catch (error) {
        logger.error(`Error triggering SOS for user ${uid}:`, error);
        if (error instanceof https.HttpsError) {
            throw error; // Re-throw HttpsError to be sent to the client
        }
        throw new https.HttpsError("internal", "An internal error occurred while triggering the SOS.", error);
    }
});