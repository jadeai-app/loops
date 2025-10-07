/**
 * Main entry point for all Cloud Functions.
 *
 * This file should export all the functions that are to be deployed.
 * The Firebase CLI will read this file to determine which functions to deploy.
 */

import { triggerSOS } from "./http/sos/triggerSOS";
import { notifySOS } from "./pubsub/notifySOS";

// Export all functions for deployment
export { triggerSOS, notifySOS };