import userPreferencesModifVal from '../../../../src/validation/users/userPreferencesModifVal'

describe("userPreferencesModifVal", () => {
  it("should validate valid preferences", () => {
    const body = {
      weightUnits: "kg",
      distUnits: "km",
      language: "en"
    };
    const result = userPreferencesModifVal(body);
    expect(result.error).toBeUndefined();
  });

  it("should reject invalid weight units", () => {
    const body = {
      weightUnits: "invalid",
      distUnits: "km",
      language: "en"
    };
    const result = userPreferencesModifVal(body);
    expect(result.error).toBeDefined();
  });

  it("should reject invalid language", () => {
    const body = {
      weightUnits: "kg",
      distUnits: "km",
      language: "es"
    };
    const result = userPreferencesModifVal(body);
    expect(result.error).toBeDefined();
  });

  it("should allow partial updates", () => {
    const bodies = [
      { weightUnits: "kg" },
      { distUnits: "mi" },
      { language: "fr" }
    ];
    
    bodies.forEach(body => {
      const result = userPreferencesModifVal(body);
      expect(result.error).toBeUndefined();
    });
  });

  it("should validate empty object", () => {
    const result = userPreferencesModifVal({});
    expect(result.error).toBeUndefined();
  });

  it("should reject invalid distance units", () => {
    const body = {
      weightUnits: "kg",
      distUnits: "invalid",
      language: "en"
    };
    const result = userPreferencesModifVal(body);
    expect(result.error).toBeDefined();
  });
});
