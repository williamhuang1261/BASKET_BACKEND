import userItemsDelVal from '../../../../src/validation/users/userItemsDelVal'

describe('userItemsDelVal', () => {
  test('should validate valid items array', () => {
    const body = {
      items: ['item1', 'item2', 'item3']
    };
    const res = userItemsDelVal(body);
    expect(res.error).toBeUndefined();
  });

  test('should validate empty items array', () => {
    const body = { items: [] };
    const res = userItemsDelVal(body);
    expect(res.error).toBeUndefined();
  });

  test('should reject missing items array', () => {
    const body = {};
    const res = userItemsDelVal(body);
    expect(res.error).toBeDefined();
  });

  test('should reject non-array items', () => {
    const body = { items: 'not-an-array' };
    const res = userItemsDelVal(body);
    expect(res.error).toBeDefined();
  });

  test('should reject array with non-string elements', () => {
    const body = { items: ['valid', 123, true] };
    const res = userItemsDelVal(body);
    expect(res.error).toBeDefined();
  });

  test('should reject array with empty strings', () => {
    const body = { items: ['valid', ''] };
    const res = userItemsDelVal(body);
    expect(res.error).toBeDefined();
  });

  test('should reject array with null elements', () => {
    const body = { items: ['valid', null] };
    const res = userItemsDelVal(body);
    expect(res.error).toBeDefined();
  });

  test('should reject array with undefined elements', () => {
    const body = { items: ['valid', undefined] };
    const res = userItemsDelVal(body);
    expect(res.error).toBeDefined();
  });

  test('should validate array with valid string IDs', () => {
    const body = { items: ['123e4567-e89b-12d3-a456-426614174000', 'item_123'] };
    const res = userItemsDelVal(body);
    expect(res.error).toBeUndefined();
  });
});