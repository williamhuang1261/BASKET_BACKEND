import { beforeEach, describe, expect, it } from "vitest";
import valEvent from "../../../../src/validation/events/valEvent";

describe("valEvent", () => {
  let values: any;
  beforeEach(() => {
    values = {
      experimentId: "savings-summary-framing",
      variant: "A",
      eventType: "exposure",
      sessionId: "3f1c2e9a-test-session",
    };
  });
  const exec = () => {
    return valEvent(values);
  };

  it("Should return no error if everything is valid", () => {
    const res = exec();
    expect(res.error).toBeUndefined();
  });

  it("Should return no error for variant B / conversion", () => {
    values.variant = "B";
    values.eventType = "conversion";
    const res = exec();
    expect(res.error).toBeUndefined();
  });

  it("Should return an error if experimentId is missing", () => {
    values.experimentId = undefined;
    let res = exec();
    expect(res.error).toBeDefined();

    values.experimentId = "";
    res = exec();
    expect(res.error).toBeDefined();
  });

  it("Should return an error if variant is not A or B", () => {
    values.variant = "C";
    let res = exec();
    expect(res.error).toBeDefined();

    values.variant = undefined;
    res = exec();
    expect(res.error).toBeDefined();
  });

  it("Should return an error if eventType is not exposure or conversion", () => {
    values.eventType = "click";
    let res = exec();
    expect(res.error).toBeDefined();

    values.eventType = undefined;
    res = exec();
    expect(res.error).toBeDefined();
  });

  it("Should return an error if sessionId is missing", () => {
    values.sessionId = undefined;
    let res = exec();
    expect(res.error).toBeDefined();

    values.sessionId = "";
    res = exec();
    expect(res.error).toBeDefined();
  });

  it("Should return an error if an unknown field is present", () => {
    values.extra = "not allowed";
    const res = exec();
    expect(res.error).toBeDefined();
  });
});
