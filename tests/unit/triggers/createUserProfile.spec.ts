import { UserRecord } from 'firebase-functions/v2/auth';
import * as logger from 'firebase-functions/logger';
import { userProfileCreationHandler } from '../../../functions/src/triggers/createUserProfile';

// Mock the entire firebase-functions/v2/auth module
jest.mock('firebase-functions/v2/auth', () => ({
  onNewUser: jest.fn((handler) => handler),
}));

// Import the mock implementations to control them in tests
const { __mockSet } = require('firebase-admin');

describe('userProfileCreationHandler Unit Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('should create a new user profile with onboarding set to false', async () => {
    // 1. Arrange: Create a mock user record
    const mockUser = {
      uid: 'new-test-user-123',
      email: 'newuser@example.com',
    } as UserRecord;

    // 2. Act: Call the handler with the mock user
    await userProfileCreationHandler(mockUser);

    // 3. Assert: Verify that the profile was created correctly
    expect(__mockSet).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      onboardingComplete: false,
      createdAt: expect.any(Date),
    });

    // Also assert that logging works as expected
    expect(logger.info).toHaveBeenCalledWith(
      `Successfully created profile for user: ${mockUser.uid}`
    );
  });

  test('should log an error if profile creation fails', async () => {
    // 1. Arrange: Create a mock user and simulate a Firestore error
    const mockUser = {
      uid: 'failing-user-456',
      email: 'fail@example.com',
    } as UserRecord;

    const firestoreError = new Error('Firestore is unavailable');
    __mockSet.mockRejectedValueOnce(firestoreError);

    // 2. Act: Call the handler
    await userProfileCreationHandler(mockUser);

    // 3. Assert: Verify that the error was logged
    expect(logger.error).toHaveBeenCalledWith(
      `Failed to create profile for user: ${mockUser.uid}`,
      { error: firestoreError }
    );
  });
});