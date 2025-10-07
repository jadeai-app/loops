import { auth } from 'firebase-functions/v2';
import { createUserProfile } from '../../../functions/src/triggers/createUserProfile';

// Import the mock implementations to control them in tests
const { __mockSet } = require('firebase-admin');
const { logger } = require('firebase-functions/v2');

describe('createUserProfile Trigger Unit Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('should create a new user profile with onboarding set to false', async () => {
    // 1. Arrange: Create a mock user record
    const mockUser = {
      uid: 'new-test-user-123',
      email: 'newuser@example.com',
      // Add other properties as required by the UserRecord type if needed
    } as auth.UserRecord;

    // 2. Act: Call the function with the mock user
    await createUserProfile(mockUser);

    // 3. Assert: Verify that the profile was created correctly
    expect(__mockSet).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      onboardingComplete: false,
      createdAt: expect.any(Date), // Check that a date is being set
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
    } as auth.UserRecord;

    const firestoreError = new Error('Firestore is unavailable');
    __mockSet.mockRejectedValueOnce(firestoreError);

    // 2. Act: Call the function
    await createUserProfile(mockUser);

    // 3. Assert: Verify that the error was logged
    expect(logger.error).toHaveBeenCalledWith(
      `Failed to create profile for user: ${mockUser.uid}`,
      { error: firestoreError }
    );
  });
});