import { https } from 'firebase-functions/v2';
import { createFirstCircle } from '../../../functions/src/http/onboarding/createFirstCircle';

// Import the mock implementations to control them in tests
const { __mockAdd } = require('firebase-admin');
const { logger } = require('firebase-functions/v2');

describe('createFirstCircle Callable Unit Tests', () => {
  const mockAuth = {
    uid: 'test-user-123',
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    __mockAdd.mockResolvedValue({ id: 'new-circle-id' });
  });

  test('should create a new circle for an authenticated user', async () => {
    // 1. Arrange
    const request = {
      auth: mockAuth,
      data: { circleName: 'My First Circle' },
    } as https.CallableRequest;

    // 2. Act
    const result = await createFirstCircle(request);

    // 3. Assert
    expect(__mockAdd).toHaveBeenCalledWith({
      name: 'My First Circle',
      owner_uid: mockAuth.uid,
      members: [mockAuth.uid],
      created_at: expect.any(Date),
    });
    expect(result).toEqual({
      success: true,
      circleId: 'new-circle-id',
    });
    expect(logger.info).toHaveBeenCalledWith(
      `Successfully created circle new-circle-id for user ${mockAuth.uid}`
    );
  });

  test('should throw an error for unauthenticated users', async () => {
    // 1. Arrange
    const request = {
      data: { circleName: 'My First Circle' },
    } as https.CallableRequest; // No auth context

    // 2. Act & 3. Assert
    await expect(createFirstCircle(request)).rejects.toThrow(
      'You must be logged in to create a circle.'
    );
    expect(logger.error).toHaveBeenCalledWith(
      'Create circle attempt by unauthenticated user.'
    );
  });

  test('should throw an error if circleName is invalid', async () => {
    // 1. Arrange
    const request = {
      auth: mockAuth,
      data: { circleName: '' }, // Invalid name
    } as https.CallableRequest;

    // 2. Act & 3. Assert
    await expect(createFirstCircle(request)).rejects.toThrow(
      'A valid circle name must be provided.'
    );
  });

  test('should throw an internal error if Firestore operation fails', async () => {
    // 1. Arrange
    const firestoreError = new Error('Firestore is down');
    __mockAdd.mockRejectedValueOnce(firestoreError);

    const request = {
      auth: mockAuth,
      data: { circleName: 'My First Circle' },
    } as https.CallableRequest;

    // 2. Act & 3. Assert
    await expect(createFirstCircle(request)).rejects.toThrow(
      'An unexpected error occurred while creating your circle.'
    );
    expect(logger.error).toHaveBeenCalledWith(
      `Failed to create circle for user: ${mockAuth.uid}`,
      { error: firestoreError }
    );
  });
});