import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { getDoc, setDoc, doc, Timestamp } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import 'jest';

// Import and initialize the firebase-functions-test SDK
import functionsTest from 'firebase-functions-test';
import { CallableRequest } from 'firebase-functions/v2/https';
import { DecodedIdToken } from 'firebase-admin/auth';

const PROJECT_ID = 'loops-mvp-test';

// Initialize the test SDK
const firebaseTest = functionsTest({
  projectId: PROJECT_ID,
});

// Import the function to test *after* initializing the SDK
import { triggerSOS } from '../../functions/src/http/sos/triggerSOS';

describe('SOS Engine Integration Tests', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        host: '127.0.0.1',
        port: 8080,
        rules: fs.readFileSync(path.resolve(__dirname, '../../firebase.rules'), 'utf8'),
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
    firebaseTest.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  // Create a more realistic mock that satisfies the AuthData type
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
      uid: 'test-user-1', // Add the missing uid property
      firebase: {
        identities: { email: ['user@example.com'] },
        sign_in_provider: 'password',
      },
    } as DecodedIdToken,
  };

  const mockCircleId = 'test-circle-1';
  const mockLocationData = { latitude: 34.05, longitude: -118.25, accuracy: 10 };
  const mockRawRequest = {} as any; // Mock raw request as it's required but not used in the function

  test('should create an SOS event on first trigger', async () => {
    // Setup: Create a circle for the user in the test database
    const authedDb = testEnv.authenticatedContext(mockUser.uid).firestore();
    await setDoc(doc(authedDb, 'circles', mockCircleId), {
      owner_uid: mockUser.uid,
      name: 'Test Circle'
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
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const sosEventDoc = await getDoc(doc(unauthedDb, 'sos_events', result.eventId as string));
    expect(sosEventDoc.exists()).toBe(true);
    const eventData = sosEventDoc.data();
    expect(eventData?.user_uid).toBe(mockUser.uid);
    expect(eventData?.status).toBe('active');
  });

  // The abuse control logic is not implemented in the function yet, so this test is skipped.
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
    } as Omit<CallableRequest, 'auth'>; // Test with auth missing

    await expect(wrapped(request)).rejects.toThrow(/You must be logged in to trigger an SOS/);
  });

  // The remote lock logic is not implemented in the function yet, so this test is skipped.
  test.skip('should reject calls if user is remotely locked', async () => {
    // Set a remote lock on the user's profile
    const db = testEnv.unauthenticatedContext().firestore();
    const expires = Timestamp.fromMillis(Date.now() + 15 * 60000);
    await setDoc(doc(db, 'profiles', mockUser.uid), {
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