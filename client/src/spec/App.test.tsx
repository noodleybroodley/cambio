import { describe, expect, it } from '@jest/globals';
import { backendRoute } from '../config';

describe('backend configuration', () => {
  it('falls back to the local backend when the env var is missing', () => {
    const original = process.env.REACT_APP_BACKEND_ROUTE;
    delete process.env.REACT_APP_BACKEND_ROUTE;

    expect(backendRoute()).toBe('http://localhost:8080');

    if (original) {
      process.env.REACT_APP_BACKEND_ROUTE = original;
    }
  });
});