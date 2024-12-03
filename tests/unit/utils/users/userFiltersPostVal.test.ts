import userFiltersPostVal from '../../../../src/validation/users/userFiltersPostVal'


describe("userFiltersPostVal", () => {
  it("should validate valid filters", () => {
    const body = {
      searchFilters: {
        distance: {
          amount: 10,
          units: "km"
        },
        categories: ["Produce", "Dairy"],
        stores: ['asjdfklasjdflkjasldf']
      },
      basketFilters: {
        filteredStores: ['ajsdklfajsd;lfksa'],
        maxStores: 5
      }
    };
    const res = userFiltersPostVal(body);
    expect(res.error).toBeUndefined();
  });

  it("should reject invalid distance units", () => {
    const body = {
      searchFilters: {
        distance: {
          amount: 10,
          units: "invalid"
        }
      }
    };
    const res = userFiltersPostVal(body);
    expect(res.error).toBeDefined();
  });

  it("should allow null maxStores", () => {
    const body = {
      basketFilters: {
        maxStores: null
      }
    };
    const res = userFiltersPostVal(body);
    expect(res.error).toBeUndefined();
  });

  it("should accept empty arrays for categories and stores", () => {
    const body = {
      searchFilters: {
        distance: {
          amount: 5,
          units: "km"
        },
        categories: [],
        stores: []
      }
    };
    const res = userFiltersPostVal(body);
    expect(res.error).toBeUndefined();
  });

  it("should reject negative distance amount", () => {
    const body = {
      searchFilters: {
        distance: {
          amount: -10,
          units: "km"
        }
      }
    };
    const res = userFiltersPostVal(body);
    expect(res.error).toBeDefined();
  });

  it("should reject negative maxStores", () => {
    const body = {
      basketFilters: {
        maxStores: -5
      }
    };
    const res = userFiltersPostVal(body);
    expect(res.error).toBeDefined();
  });

  it("should accept missing optional fields", () => {
    const body = {
      searchFilters: {
        distance: {
          amount: 10,
          units: "km"
        }
      }
    };
    const res = userFiltersPostVal(body);
    expect(res.error).toBeUndefined();
  });
});
