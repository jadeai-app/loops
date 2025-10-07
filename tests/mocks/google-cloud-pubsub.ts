const mockPublishJSON = jest.fn();

const PubSub = jest.fn(() => ({
  topic: jest.fn(() => ({
    publishJSON: mockPublishJSON,
  })),
}));

module.exports = {
  PubSub,
  // Export mock implementations so they can be controlled from tests
  __mockPublishJSON: mockPublishJSON,
};