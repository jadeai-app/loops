/**
 * Main entry point for all Cloud Functions.
 *
 * This file should export all the functions that are to be deployed.
 * The Firebase CLI will read this file to determine which functions to deploy.
 */

import { triggerSOS } from "./http/sos/triggerSOS";
import { enforceAbuseControls } from "./triggers/enforceAbuseControls";

// Export all functions for deployment
export { triggerSOS, enforceAbuseControls };
