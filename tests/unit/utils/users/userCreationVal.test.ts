import UserProps from '../../../../src/interface/UserProps';
import userCreationValidation from '../../../../src/validation/users/userCreationVal'
import {describe, it, expect} from 'vitest'

describe('userCreationValidation', () => {
  const validUser: UserProps = {
    uid: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    location: {
      country: 'Canada',
      type: 'Point',
      coordinates: [45.5017, -73.5673],
      formattedAddress: '123 it St'
    },
    account: {
      isSupplier: false,
      isAdmin: false
    },
    membership: new Map([['basic', true]]),
    preferences: {
      weightUnits: 'kg',
      distUnits: 'km',
      language: 'en'
    },
    items: new Map(),
    filters: {
      searchPreferences: {
        distance: {
          amount: 10,
          units: 'km'
        },
        categories: new Map(),
        stores: new Map()
      },
      basketFilters: {
        filteredStores: new Map(),
        maxStores: null
      }
    }
  };

  it('should validate valid user', () => {
    const res = userCreationValidation(validUser);
    expect(res.error).toBeUndefined();
  });

  it('should reject invalid country', () => {
    const invalidUser = {
      ...validUser,
      location: { ...validUser.location, country: 'Invalid' }
    };
    const res = userCreationValidation(invalidUser);
    expect(res.error).toBeDefined();
  });

  it('should reject invalid language', () => {
    const invalidUser = {
      ...validUser,
      preferences: { ...validUser.preferences, language: 'es' }
    };
    const res = userCreationValidation(invalidUser);
    expect(res.error).toBeDefined();
  });

  it('should validate supplier info when isSupplier is true', () => {
    const supplierUser = {
      ...validUser,
      account: { ...validUser.account, isSupplier: true },
      supplierInfo: {
        supplier: 'sup1',
        supplierAdd: 'add1',
        supplierUpdate: 'update1',
        supplierGet: 'get1',
        supplierDelete: 'delete1'
      }
    };
    const res = userCreationValidation(supplierUser);
    expect(res.error).toBeUndefined();
  });

  it('should reject invalid email format', () => {
    const invalidUser = {
      ...validUser,
      email: 'invalid-email'
    };
    const res = userCreationValidation(invalidUser);
    expect(res.error).toBeDefined();
  });

  it('should allow empty membership array', () => {
    const userWithEmptyMembership = {
      ...validUser,
      membership: new Map()
    };
    const res = userCreationValidation(userWithEmptyMembership);
    expect(res.error).toBeUndefined();
  });

  it('should validate admin info when isAdmin is true', () => {
    const adminUser = {
      ...validUser,
      account: { ...validUser.account, isAdmin: true },
      adminInfo: {
        adminAdd: 'add1',
        adminUpdate: 'update1',
        adminGet: 'get1',
        adminDelete: 'delete1'
      }
    };
    const res = userCreationValidation(adminUser);
    expect(res.error).toBeUndefined();
  });

  it('should reject invalid distance units in filters', () => {
    const invalidUser = {
      ...validUser,
      filters: {
        ...validUser.filters,
        searchPreferences: {
          ...validUser.filters.searchPreferences,
          distance: {
            amount: 10,
            units: 'invalid'
          }
        }
      }
    };
    const res = userCreationValidation(invalidUser);
    expect(res.error).toBeDefined();
  });

  it('should reject negative distance amount in filters', () => {
    const invalidUser = {
      ...validUser,
      filters: {
        ...validUser.filters,
        searchPreferences: {
          ...validUser.filters.searchPreferences,
          distance: {
            amount: -10,
            units: 'km'
          }
        }
      }
    };
    const res = userCreationValidation(invalidUser);
    expect(res.error).toBeDefined();
  });

  it('should reject a 0 distance amount in filters', () => {
    const invalidUser = {
      ...validUser,
      filters: {
        ...validUser.filters,
        searchPreferences: {
          ...validUser.filters.searchPreferences,
          distance: {
            amount: 0,
            units: 'km'
          }
        }
      }
    }
    const res = userCreationValidation(invalidUser);
    expect(res.error).toBeDefined();
  });

  it('should validate when all optional fields are missing', () => {
    const minimalUser = {
      uid: 'user123',
      location: {
        country: 'Canada'
      },
      account: {
        isSupplier: false,
        isAdmin: false
      },
      membership: new Map(),
      preferences: {
        weightUnits: 'kg',
        distUnits: 'km',
        language: 'en'
      },
      items: new Map(),
      filters: {
        searchPreferences: {
          distance: {
            amount: 10,
            units: 'km'
          },
          categories: new Map(),
          stores: new Map()
        },
        basketFilters: {
          filteredStores: new Map(),
          maxStores: null
        }
      }
    };
    const res = userCreationValidation(minimalUser);
    expect(res.error).toBeUndefined();
  });
});