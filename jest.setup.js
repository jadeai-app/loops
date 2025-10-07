// Jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom');

// Polyfill for TextEncoder/TextDecoder, which are used by jose (a dependency of firebase-admin)
// and are not available in the default Node.js test environment.
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;