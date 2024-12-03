import userFiltersDelVal from "../../../../src/validation/users/userFiltersDelVal";

describe("userFiltersDelVal", () => {
  it("should validate valid deletion request", () => {
    const body = {
      categories: ["Produce", "Dairy"],
      stores: ['ajsdklfajsdfkla'],
      filteredStores: ['ahsdklfjnasodfn'],
      maxStores: null
    };
    const res = userFiltersDelVal(body);
    expect(res.error).toBeUndefined();
  });

  it("should reject invalid categories", () => {
    const body = {
      categories: ["InvalidCategory"]
    };
    const res = userFiltersDelVal(body);
    expect(res.error).toBeDefined();
  });

  it("should validate partial deletion request", () => {
    const body = {
      stores: ['ahsdklfjnasodfn']
    };
    const res = userFiltersDelVal(body);
    expect(res.error).toBeUndefined();
  });

  it("should validate empty arrays", () => {
    const body = {
      categories: [],
      stores: [],
      filteredStores: []
    };
    const res = userFiltersDelVal(body);
    expect(res.error).toBeUndefined();
  });

  it("should reject non-array categories", () => {
    const body = {
      categories: "Produce"
    };
    const res = userFiltersDelVal(body);
    expect(res.error).toBeDefined();
  });

  it("should reject non-array stores", () => {
    const body = {
      stores: "storeId123"
    };
    const res = userFiltersDelVal(body);
    expect(res.error).toBeDefined();
  });

  it("should validate when all fields are provided correctly", () => {
    const body = {
      categories: ["Produce", "Dairy"],
      stores: ['store1', 'store2'],
      filteredStores: ['store3', 'store4'],
      maxStores: null
    };
    const res = userFiltersDelVal(body);
    expect(res.error).toBeUndefined();
  });

  it("should reject when any array contains non-string values", () => {
    const body = {
      categories: ["Produce", 123],
      stores: ['store1', {}],
      filteredStores: ['store3', null]
    };
    const res = userFiltersDelVal(body);
    expect(res.error).toBeDefined();
  });
});
