const mockGet = jest.fn();
const mockAdd = jest.fn();
const mockSet = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockCollection = jest.fn(() => ({
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  get: mockGet,
  doc: jest.fn(() => ({
    get: mockGet,
    set: mockSet,
    update: mockUpdate,
    delete: mockDelete,
  })),
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
  __mockSet: mockSet,
  __mockUpdate: mockUpdate,
  __mockDelete: mockDelete,
};