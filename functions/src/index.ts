import { initializeApp } from "firebase-admin/app";

// Initialize the Firebase Admin SDK.
// This should be done once per function deployment.
initializeApp();

// Export all the functions that should be deployed.

// HTTP Triggers
export { triggerSOS } from "./http/sos/triggerSOS";

// Pub/Sub Triggers
export { notifySOS } from "./pubsub/notifySOS";

// Note: The core rate-limiting logic is consolidated into `triggerSOS` for efficiency.
// Other asynchronous triggers are listed below.