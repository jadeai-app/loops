// This file is used to set up the environment for integration tests.

const { initializeApp } = require('firebase-admin/app');

// Initialize the Firebase Admin SDK. This is required for any tests that use
// the Admin SDK to interact with Firebase services (e.g., calling Cloud Functions).
// The emulator suite will automatically intercept these calls.
initializeApp({
  projectId: 'demo-project', // Use a consistent demo project ID
});