const mockGet = jest.fn();
const mockAdd = jest.fn();
const mockCollection = jest.fn(() => ({
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  get: mockGet,
  doc: jest.fn().mockReturnThis(),
  add: mockAdd,
}));

const firestore = () => ({
  collection: mockCollection,
});

firestore.Timestamp = {
  fromMillis: (ms: number) => new Date(ms),
};

module.exports = {
  apps: [],
  initializeApp: jest.fn(),
  firestore,
  auth: () => jest.fn(), // Add mock for auth
  messaging: () => jest.fn(), // Add mock for messaging
  // Export mock implementations so they can be controlled from tests
  __mockGet: mockGet,
  __mockAdd: mockAdd,
};