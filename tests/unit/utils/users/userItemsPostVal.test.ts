import userItemsPostVal from '../../../../src/validation/users/userItemsPostVal'

describe('userItemsPostVal', () => {
  test('should validate valid items', () => {
    const body = {
      items: [{
        id: 'item1',
        select: {
          method: 'weight',
          units: 'kg',
          quantity: 1.5
        }
      }]
    };
    const res = userItemsPostVal(body);
    expect(res.error).toBeUndefined();
  });

  test('should reject invalid method', () => {
    const body = {
      items: [{
        id: 'item1',
        select: {
          method: 'invalid',
          units: 'kg',
          quantity: 1.5
        }
      }]
    };
    const res = userItemsPostVal(body);
    expect(res.error).toBeDefined();
  });

  test('should reject invalid units', () => {
    const body = {
      items: [{
        id: 'item1',
        select: {
          method: 'weight',
          units: 'invalid',
          quantity: 1.5
        }
      }]
    };
    const res = userItemsPostVal(body);
    expect(res.error).toBeDefined();
  });

  test('should reject missing required fields', () => {
    const body = {
      items: [{
        id: 'item1',
        select: {
          method: 'weight',
          units: 'kg'
        }
      }]
    };
    const res = userItemsPostVal(body);
    expect(res.error).toBeDefined();
  });

  test('should reject negative quantity', () => {
    const body = {
      items: [{
        id: 'item1',
        select: {
          method: 'weight',
          units: 'kg',
          quantity: -1.5
        }
      }]
    };
    const res = userItemsPostVal(body);
    expect(res.error).toBeDefined();
  });

  test('should reject zero quantity', () => {
    const body = {
      items: [{
        id: 'item1',
        select: {
          method: 'weight',
          units: 'kg',
          quantity: 0
        }
      }]
    };
    const res = userItemsPostVal(body);
    expect(res.error).toBeDefined();
  });

  test('should reject empty items array', () => {
    const body = {
      items: []
    };
    const res = userItemsPostVal(body);
    expect(res.error).toBeDefined();
  });

  test('should validate multiple valid items', () => {
    const body = {
      items: [
        {
          id: 'item1',
          select: {
            method: 'weight',
            units: 'kg',
            quantity: 1.5
          }
        },
        {
          id: 'item2',
          select: {
            method: 'unit',
            units: 'unit',
            quantity: 3
          }
        }
      ]
    };
    const res = userItemsPostVal(body);
    expect(res.error).toBeUndefined();
  });

  test('should reject if any item in array is invalid', () => {
    const body = {
      items: [
        {
          id: 'item1',
          select: {
            method: 'weight',
            units: 'kg',
            quantity: 1.5
          }
        },
        {
          id: 'item2',
          select: {
            method: 'invalid',
            units: 'kg',
            quantity: 3
          }
        }
      ]
    };
    const res = userItemsPostVal(body);
    expect(res.error).toBeDefined();
  });
});