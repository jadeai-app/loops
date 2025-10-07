/**
 * Main entry point for all Firebase Functions in this project.
 * All functions should be exported from this file to be deployed.
 */

// Import and export the triggerSOS function
import { triggerSOS } from './http/sos/triggerSOS';

export {
  triggerSOS,
};