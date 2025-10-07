import { https } from 'firebase-functions/v2';
import { triggerSOS } from '../../functions/src/http/sos/triggerSOS';

// Import the mock implementations to control them in tests
const { __mockGet, __mockAdd } = require('firebase-admin');
const { __mockPublishJSON } = require('@google-cloud/pubsub');
const { logger } = require('firebase-functions/v2');


describe('triggerSOS Unit Tests', () => {
  const mockAuth = {
    uid: 'test-user-1',
    token: { uid: 'test-user-1' } as any,
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    __mockAdd.mockResolvedValue({ id: 'test-event-id' });
    __mockPublishJSON.mockResolvedValue('test-message-id');
  });

  test('should throw an error if user has no circle', async () => {
    // Setup: No remote lock, no recent SOS events, but no circles
    __mockGet.mockResolvedValueOnce({ exists: false }); // Profile check
    __mockGet.mockResolvedValueOnce({ size: 0 }); // Abuse check
    __mockGet.mockResolvedValueOnce({ empty: true }); // Circle check

    const request = { auth: mockAuth, data: {} } as https.CallableRequest;

    await expect(triggerSOS(request)).rejects.toThrow(
      'You must create a circle before you can trigger an SOS.'
    );
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('has no circles'));
  });

  test('should succeed even if Pub/Sub publishing fails', async () => {
    // Setup: All checks pass, but Pub/Sub fails
    __mockGet.mockResolvedValueOnce({ exists: false }); // Profile
    __mockGet.mockResolvedValueOnce({ size: 0 }); // Abuse
    __mockGet.mockResolvedValueOnce({
      empty: false,
      docs: [{ id: 'test-circle-id' }],
    }); // Circle

    __mockPublishJSON.mockRejectedValue(new Error('Pub/Sub is down'));

    const request = { auth: mockAuth, data: {} } as https.CallableRequest;
    const result = await triggerSOS(request);

    expect(result.success).toBe(true);
    expect(result.eventId).toBe('test-event-id');
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to publish event'),
      expect.any(Object)
    );
  });

  test('should save location data when provided', async () => {
    // Setup: All checks pass
    __mockGet.mockResolvedValueOnce({ exists: false }); // Profile
    __mockGet.mockResolvedValueOnce({ size: 0 }); // Abuse
    __mockGet.mockResolvedValueOnce({
      empty: false,
      docs: [{ id: 'test-circle-id' }],
    }); // Circle

    const locationData = { latitude: 12.34, longitude: 56.78 };
    const request = {
      auth: mockAuth,
      data: { location: locationData },
    } as https.CallableRequest;

    await triggerSOS(request);

    expect(__mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        location: locationData,
      })
    );
  });
});