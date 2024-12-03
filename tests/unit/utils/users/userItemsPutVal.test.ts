import userItemsPutVal from '../../../../src/validation/users/userItemsPutVal';

describe('userItemsPutVal', () => {
  test('should validate valid items update', () => {
    const body = {
      items: [{
        id: 'item1',
        select: {
          method: 'weight',
          units: 'kg',
          quantity: 2.5
        }
      }]
    };
    const res = userItemsPutVal(body);
    expect(res.error).toBeUndefined();
  });

  test('should validate multiple items update', () => {
    const body = {
      items: [
        {
          id: 'item1',
          select: {
            method: 'weight',
            units: 'kg',
            quantity: 2.5
          }
        },
        {
          id: 'item2',
          select: {
            method: 'weight',
            units: 'oz',
            quantity: 3
          }
        }
      ]
    };
    const res = userItemsPutVal(body);
    expect(res.error).toBeUndefined();
  });

  test('should reject invalid method', () => {
    const body = {
      items: [{
        id: 'item1',
        select: {
          method: 'invalid',
          units: 'kg',
          quantity: 2.5
        }
      }]
    };
    const res = userItemsPutVal(body);
    expect(res.error).toBeDefined();
  });

  test('should reject missing id', () => {
    const body = {
      items: [{
        select: {
          method: 'weight',
          units: 'kg',
          quantity: 2.5
        }
      }]
    };
    const res = userItemsPutVal(body);
    expect(res.error).toBeDefined();
  });

  test('should reject invalid quantities', () => {
    const bodies = [
      {
        items: [{
          id: 'item1',
          select: { method: 'weight', units: 'kg', quantity: -1 }
        }]
      },
      {
        items: [{
          id: 'item1',
          select: { method: 'weight', units: 'kg', quantity: 'invalid' }
        }]
      }
    ];

    bodies.forEach(body => {
      const res = userItemsPutVal(body);
      expect(res.error).toBeDefined();
    });
  });

  test('should reject empty items array', () => {
    const body = { items: [] };
    const res = userItemsPutVal(body);
    expect(res.error).toBeDefined();
  });

  test('should reject missing select object', () => {
    const body = {
      items: [{
        id: 'item1'
      }]
    };
    const res = userItemsPutVal(body);
    expect(res.error).toBeDefined();
  });
});