const mockSet = jest.fn();
const mockGet = jest.fn();
const mockAdd = jest.fn();

const mockDoc = jest.fn(() => ({
  set: mockSet,
  get: mockGet,
}));

const mockCollection = jest.fn(() => ({
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  get: mockGet,
  doc: mockDoc,
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
  auth: () => jest.fn(),
  messaging: () => jest.fn(),
  // Export mock implementations so they can be controlled from tests
  __mockGet: mockGet,
  __mockAdd: mockAdd,
  __mockSet: mockSet,
};