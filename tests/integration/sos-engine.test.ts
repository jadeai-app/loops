import functionsTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { CallableRequest } from 'firebase-functions/v2/https';
import { DecodedIdToken } from 'firebase-admin/auth';
import 'jest';

const PROJECT_ID = 'loops-mvp-test';

// Initialize firebase-functions-test
const firebaseTest = functionsTest({
  projectId: PROJECT_ID,
});

// Initialize firebase-admin
if (admin.apps.length === 0) {
  admin.initializeApp({ projectId: PROJECT_ID });
}
const db = admin.firestore();

// Import the function to test *after* initializing the SDKs
import { triggerSOS } from '../../functions/src/http/sos/triggerSOS';

// Helper to clear firestore
const clearFirestore = async () => {
  const deleteUrl = `http://127.0.0.1:8080/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
  try {
    await fetch(deleteUrl, { method: 'DELETE' });
  } catch (error) {
    console.error('Error clearing Firestore:', error);
  }
};

describe('SOS Engine Integration Tests', () => {
  afterAll(async () => {
    firebaseTest.cleanup();
    // Clean up all admin apps
    await Promise.all(admin.apps.map(app => app?.delete()));
  });

  beforeEach(async () => {
    await clearFirestore();
  });

  const mockUser = {
    uid: 'test-user-1',
    token: {
      email: 'user@example.com',
      aud: 'loops-mvp-test',
      auth_time: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      iss: `https://securetoken.google.com/${PROJECT_ID}`,
      sub: 'test-user-1',
      uid: 'test-user-1',
      firebase: {
        identities: { email: ['user@example.com'] },
        sign_in_provider: 'password',
      },
    } as DecodedIdToken,
  };

  const mockCircleId = 'test-circle-1';
  const mockLocationData = { latitude: 34.05, longitude: -118.25, accuracy: 10 };
  const mockRawRequest = {} as any;

  test('should create an SOS event on first trigger', async () => {
    // Setup: Create a circle for the user
    await db.collection('circles').doc(mockCircleId).set({
      name: 'Test Circle',
      owner_uid: mockUser.uid,
      members: [mockUser.uid],
    });

    const wrapped = firebaseTest.wrap(triggerSOS);

    const request: CallableRequest = {
      data: { ...mockLocationData, circleId: mockCircleId },
      auth: mockUser,
      rawRequest: mockRawRequest,
    };

    const result = await wrapped(request);

    // 1. Verify the function returned a success response
    expect(result.success).toBe(true);
    expect(result.eventId).toBeDefined();

    // 2. Verify a new sos_events document was created
    const sosEventDoc = await db.collection('sos_events').doc(result.eventId as string).get();
    expect(sosEventDoc.exists).toBe(true);
    const eventData = sosEventDoc.data();
    expect(eventData?.user_uid).toBe(mockUser.uid);
    expect(eventData?.status).toBe('active');
  });

  test.skip('should block more than 3 SOS triggers within an hour', async () => {
    const wrapped = firebaseTest.wrap(triggerSOS);
    const request: CallableRequest = {
      data: { ...mockLocationData, circleId: mockCircleId },
      auth: mockUser,
      rawRequest: mockRawRequest,
    };

    // Trigger 3 times successfully
    await wrapped(request);
    await wrapped(request);
    await wrapped(request);

    // 4. The fourth attempt should fail with the correct error
    await expect(wrapped(request)).rejects.toThrow(/You have exceeded the SOS limit/);
  });

  test('should reject calls from unauthenticated users', async () => {
    const wrapped = firebaseTest.wrap(triggerSOS);
    const request = {
      data: { ...mockLocationData, circleId: mockCircleId },
      rawRequest: mockRawRequest,
    } as Omit<CallableRequest, 'auth'>;

    await expect(wrapped(request)).rejects.toThrow(/You must be logged in to trigger an SOS/);
  });

  test.skip('should reject calls if user is remotely locked', async () => {
    // Set a remote lock on the user's profile
    const expires = admin.firestore.Timestamp.fromMillis(Date.now() + 15 * 60000);
    await db.collection('profiles').doc(mockUser.uid).set({
        remote_lock_expires: expires,
    });

    const wrapped = firebaseTest.wrap(triggerSOS);
    const request: CallableRequest = {
      data: { ...mockLocationData, circleId: mockCircleId },
      auth: mockUser,
      rawRequest: mockRawRequest,
    };

    await expect(wrapped(request)).rejects.toThrow(/Your account is temporarily locked/);
  });
});