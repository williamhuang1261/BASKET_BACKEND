import userLocationModifVal from '../../../../src/validation/users/userLocationModifVal';

describe("userLocationModifVal", () => {
  it("should validate valid location data", () => {
    const body = {
      country: "Canada",
      type: "Point",
      coordinates: [-73.5673, 45.5017],
      formattedAddress: "Montreal, QC, Canada"
    };
    const res = userLocationModifVal(body);
    expect(res.error).toBeUndefined();
  });

  it("should reject invalid country", () => {
    const body = {
      country: "France",
      type: "Point",
      coordinates: [-73.5673, 45.5017],
      formattedAddress: "Paris, France"
    };
    const res = userLocationModifVal(body);
    expect(res.error).toBeDefined();
  });

  it("should reject partial data", () => {
    const body = {
      type: "Point",
      coordinates: [-73.5673, 45.5017]
    };
    const res = userLocationModifVal(body);
    expect(res.error).toBeDefined();
  });

  it("should reject invalid coordinates format", () => {
    const bodies = [
      { country: "Mexico", type: "Point", coordinates: [-181, 45], formattedAddress: "Address" },
      { country: "USA", type: "Invalid", coordinates: [-73, 91], formattedAddress: "Address" },
      { country: "USA", type: "Point", coordinates: [-73], formattedAddress: "Address" },
      { country: "USA", type: "Point", coordinates: "invalid", formattedAddress: "Address" }
    ];

    bodies.forEach(body => {
      const res = userLocationModifVal(body);
      expect(res.error).toBeDefined();
    });
  });

  it("should reject invalid address format", () => {
    const body = {
      country: "USA",
      type: "Point",
      coordinates: [-73.5673, 45.5017],
      formattedAddress: "a"  // too short
    };
    const res = userLocationModifVal(body);
    expect(res.error).toBeDefined();
  });
});
