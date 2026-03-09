// jest.setup.js

// Polyfill TextEncoder and TextDecoder for the test environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill fetch for the test environment
require('whatwg-fetch');

require('@testing-library/jest-dom');

// Mock t and useTranslation from react-i18next
jest.mock('react-i18next', () => ({
	...jest.requireActual('react-i18next'),
	useTranslation: () => ({ t: (key) => key, i18n: { changeLanguage: () => Promise.resolve() } }),
}));

// Polyfill BroadcastChannel for msw
const { BroadcastChannel } = require('broadcast-channel');
global.BroadcastChannel = BroadcastChannel;

