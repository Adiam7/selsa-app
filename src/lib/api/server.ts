import { setupServer } from "msw/node";

// This file is currently empty because we are mocking API calls directly in tests.
// However, it's good practice to have a central place for MSW handlers.
// We can add shared handlers here in the future.
export const server = setupServer();
