import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { getDoc, setDoc, doc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import 'jest';

// Import and initialize the firebase-functions-test SDK
import * as functionsTest from 'firebase-functions-test';

const PROJECT_ID = 'loops-mvp-test';

// Initialize the test SDK with a different name to avoid shadowing Jest's `test` global
const firebaseTest = functionsTest({
  projectId: PROJECT_ID,
});

// Import the function to test *after* initializing the SDK
import { triggerSOS } from '../../functions/src/http/sos/triggerSOS';

describe('SOS Engine Integration Tests', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    // Set up the test environment for Firestore
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
    // Clean up the test environment and the functions test SDK
    await testEnv.cleanup();
    firebaseTest.cleanup();
  });

  beforeEach(async () => {
    // Clear Firestore data before each test
    await testEnv.clearFirestore();
  });

  const mockUser = { uid: 'test-user-1', token: { email: 'user@example.com' } };
  const mockCircleId = 'test-circle-1';
  const mockLocationData = { latitude: 34.05, longitude: -118.25, accuracy: 10 };

  test('should create an SOS event and update user limits on first trigger', async () => {
    const wrapped = firebaseTest.wrap(triggerSOS);

    // For onCall functions, pass a single object with `data` and `auth` properties
    const result = await wrapped({
      data: { ...mockLocationData, circleId: mockCircleId },
      auth: mockUser,
    });

    // 1. Verify the function returned a success response
    expect(result.status).toBe('success');
    expect(result.eventId).toBeDefined();

    // 2. Verify a new sos_events document was created
    const db = testEnv.unauthenticatedContext().firestore();
    const sosEventDoc = await getDoc(doc(db, 'sos_events', result.eventId));
    expect(sosEventDoc.exists()).toBe(true);
    const eventData = sosEventDoc.data();
    expect(eventData.user_uid).toBe(mockUser.uid);
    expect(eventData.status).toBe('active');

    // 3. Verify the user_limits document was created correctly
    const userLimitDoc = await getDoc(doc(db, 'user_limits', mockUser.uid));
    expect(userLimitDoc.exists()).toBe(true);
    const limitData = userLimitDoc.data();
    expect(limitData.sos_count).toBe(1);
  });

  test('should block more than 3 SOS triggers within an hour', async () => {
    const wrapped = firebaseTest.wrap(triggerSOS);
    const request = {
      data: { ...mockLocationData, circleId: mockCircleId },
      auth: mockUser,
    };

    // Trigger 3 times successfully
    await wrapped(request);
    await wrapped(request);
    await wrapped(request);

    // 4. The fourth attempt should fail with the correct error
    await expect(wrapped(request)).rejects.toThrow(/You have exceeded the SOS limit/);

    // Verify the count is 3
    const db = testEnv.unauthenticatedContext().firestore();
    const userLimitDoc = await getDoc(doc(db, 'user_limits', mockUser.uid));
    const limitData = userLimitDoc.data();
    expect(limitData.sos_count).toBe(3);
  });

  test('should reject calls from unauthenticated users', async () => {
    const wrapped = firebaseTest.wrap(triggerSOS);
    // Call with data but no auth context
    const request = { data: { ...mockLocationData, circleId: mockCircleId } };
    await expect(wrapped(request)).rejects.toThrow(/The function must be called while authenticated/);
  });

  test('should reject calls if user is remotely locked', async () => {
    // Set a remote lock on the user's profile
    const db = testEnv.unauthenticatedContext().firestore();
    const now = new Date();
    const expires = new Date(now.getTime() + 15 * 60000);
    await setDoc(doc(db, 'profiles', mockUser.uid), {
        remote_lock_expires: expires,
    });

    const wrapped = firebaseTest.wrap(triggerSOS);
    const request = {
      data: { ...mockLocationData, circleId: mockCircleId },
      auth: mockUser,
    };
    // Attempt to trigger SOS
    await expect(wrapped(request)).rejects.toThrow(/Your account is temporarily locked by your safety circle/);
  });
});