import { https, HttpsError } from "firebase-functions/v2";
import { getFirestore, Timestamp, GeoPoint } from "firebase-admin/firestore";
import { PubSub } from "@google-cloud/pubsub";
import * as admin from "firebase-admin";

import type { SosEvent, UserLimits } from "@/types";

// Initialize Firebase Admin SDK and Pub/Sub
admin.initializeApp();
const db = getFirestore();
const auth = admin.auth();
const pubsub = new PubSub();

// Define the function options as per the spec
const functionOptions = {
  region: "us-central1",
  minInstances: 1,
  memory: "512MiB" as const,
  timeoutSeconds: 10,
};

export const triggerSOS = https.onRequest(functionOptions, async (req, res) => {
  // 1. Authentication Check with Firebase ID Token
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.');
    res.status(401).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    res.status(401).send('Unauthorized');
    return;
  }

  let uid;
  try {
    const decodedIdToken = await auth.verifyIdToken(idToken);
    uid = decodedIdToken.uid;
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    res.status(401).send('Unauthorized');
    return;
  }

  const userLimitsRef = db.collection("user_limits").doc(uid);
  const sosEventsRef = db.collection("sos_events");

  try {
    // 2. Rate Limiting with Firestore Transaction
    await db.runTransaction(async (transaction) => {
      const userLimitsDoc = await transaction.get(userLimitsRef);
      const oneHourAgo = Timestamp.fromMillis(Date.now() - 60 * 60 * 1000);
      let limits: UserLimits = { sos_count: 0, last_sos_time: oneHourAgo };

      if (userLimitsDoc.exists) {
        const data = userLimitsDoc.data() as UserLimits;
        // Reset count if the last SOS was more than an hour ago
        if (data.last_sos_time.toMillis() < oneHourAgo.toMillis()) {
          limits = { sos_count: 0, last_sos_time: Timestamp.now() };
        } else {
          limits = data;
        }
      }

      if (limits.sos_count >= 3) {
        throw new HttpsError("resource-exhausted", "SOS limit of 3 per hour exceeded.");
      }

      // Increment count and update timestamp
      transaction.set(userLimitsRef, {
        sos_count: limits.sos_count + 1,
        last_sos_time: Timestamp.now(),
      }, { merge: true });
    });

    // 3. Create SOS Event from validated request body
    const { lat, lon, accuracy, circleId } = req.body;
    if (typeof lat !== 'number' || typeof lon !== 'number' || typeof accuracy !== 'number' || !circleId) {
        res.status(400).send("Bad Request: Missing or invalid location or circleId in request body.");
        return;
    }

    const newSosEventData: Omit<SosEvent, "id"> = {
      user_uid: uid,
      circle_id: circleId,
      status: 'active',
      location: new GeoPoint(lat, lon),
      accuracy_meters: accuracy,
      trigger_method: 'hold', // Assuming 'hold' as default for now
      created_at: Timestamp.now(),
    };

    const eventDocRef = await sosEventsRef.add(newSosEventData);

    // 4. Publish to Pub/Sub for Decoupled Notification
    const topic = pubsub.topic("sos-triggered");
    await topic.publishMessage({
      json: {
        eventId: eventDocRef.id,
        ...newSosEventData,
      },
    });

    // 5. Immediately return 202 Accepted
    res.status(202).json({
        message: "SOS accepted. Processing initiated.",
        eventId: eventDocRef.id
    });

  } catch (error) {
    console.error("Error triggering SOS:", error);
    if (error instanceof HttpsError) {
      if (error.code === 'resource-exhausted') {
        res.status(429).send(error.message);
      } else {
        res.status(500).send("An internal server error occurred.");
      }
    } else {
      res.status(500).send("An internal server error occurred.");
    }
  }
});