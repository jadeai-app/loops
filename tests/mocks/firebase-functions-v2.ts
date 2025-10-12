const logger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

const https = {
  onCall: (handler: any) => handler,
  HttpsError: class HttpsError extends Error {
    constructor(code: string, message: string) {
      super(message);
      this.name = `HttpsError: ${code}`;
    }
  },
};

const auth = {
  onNewUser: (handler) => handler,
};

const config = () => ({
  // Your mock config here
});

module.exports = {
  https,
  logger,
  auth,
  config,
};