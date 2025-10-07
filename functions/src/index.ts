/**
 * Main entry point for all Cloud Functions.
 *
 * This file should export all the functions that are to be deployed.
 * The Firebase CLI will read this file to determine which functions to deploy.
 */

import { triggerSOS } from "./http/sos/triggerSOS";
import { deleteUserData } from "./http/user/deleteUserData";
import { webrtcOffer } from "./http/webrtc/offer";
import { webrtcAnswer } from "./http/webrtc/answer";

// Export all functions for deployment
export { triggerSOS, deleteUserData, webrtcOffer, webrtcAnswer };
