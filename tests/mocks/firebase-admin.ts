const mockGet = jest.fn();
const mockAdd = jest.fn();
const mockSet = jest.fn();

const mockCollection = jest.fn(() => ({
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  get: mockGet,
  doc: jest.fn().mockReturnThis(),
  add: mockAdd,
  set: mockSet,
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
  auth: () => jest.fn(),
  messaging: () => jest.fn(),
  // Export mock implementations so they can be controlled from tests
  __mockGet: mockGet,
  __mockAdd: mockAdd,
  __mockSet: mockSet,
};