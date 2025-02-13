import { beforeEach, describe, expect, it } from "vitest";
import valAutocomplete from "../../../../src/validation/items/valAutocomplete.js";

describe("valAutocomplete", () => {
  let values;
  beforeEach(() => {
    values = {
      config: {
        value: "test",
        language: "en",
        count: 10,
      },
    };
  });
  const exec = () => {
    return valAutocomplete(values);
  };
  it("Should return no error if everything is valid", () => {
    const res = exec();
    expect(res.error).toBeUndefined();
  });
  it("Should return an error if config is missing", () => {
    values.config = undefined;
    let res = exec();
    expect(res.error).toBeDefined();

    values.config = null;
    res = exec();
    expect(res.error).toBeDefined();

    values.otherField = "other";
    res = exec();
    expect(res.error).toBeDefined();
  });
  it("Should return an error if value is missing", () => {
    values.config.value = undefined;
    let res = exec();
    expect(res.error).toBeDefined();

    values.config.value = null;
    res = exec();
    expect(res.error).toBeDefined();
  });
  it("Should return an error if value is not a string", () => {
    values.config.value = 123;
    let res = exec();
    expect(res.error).toBeDefined();

    values.config.value = { key: "value" };
    res = exec();
    expect(res.error).toBeDefined();

    values.config.value = ["value"];
    res = exec();
    expect(res.error).toBeDefined();

    values.config.value = true;
    res = exec();
    expect(res.error).toBeDefined();
  });
  it("Should return an error if length of value if smaller than 2", () => {
    values.config.value = "a";
    let res = exec();
    expect(res.error).toBeDefined();

    values.config.value = "";
    res = exec();
    expect(res.error).toBeDefined();
  });
  it("Should return an error if length of value if greater than 20", () => {
    values.config.value = "a".repeat(21);
    let res = exec();
    expect(res.error).toBeDefined();
  });
  it("Should return an error if language is missing", () => {
    values.config.language = undefined;
    let res = exec();
    expect(res.error).toBeDefined();

    values.config.language = null;
    res = exec();
    expect(res.error).toBeDefined();
  });
  it("Should return an error if language is not a string", () => {
    values.config.language = 123;
    let res = exec();
    expect(res.error).toBeDefined();

    values.config.language = { en: "en" };
    res = exec();
    expect(res.error).toBeDefined();

    values.config.language = ["en"];
    res = exec();
    expect(res.error).toBeDefined();

    values.config.language = true;
    res = exec();
    expect(res.error).toBeDefined();
  });
  it('Should return an error if language is not "en" or "fr", even capitalized', () => {
    values.config.language = "invalid";
    let res = exec();
    expect(res.error).toBeDefined();

    values.config.language = "EN";
    res = exec();
    expect(res.error).toBeDefined();

    values.config.language = "FR";
    res = exec();
    expect(res.error).toBeDefined();
  });
  it("Should return an error if count is missing", () => {
    values.config.count = undefined;
    let res = exec();
    expect(res.error).toBeDefined();

    values.config.count = null;
    res = exec();
    expect(res.error).toBeDefined();
  });
  it("Should return an error if count is not a number", () => {
    values.config.count = "123";
    let res = exec();
    expect(res.error).toBeDefined();

    values.config.count = { key: "123" };
    res = exec();
    expect(res.error).toBeDefined();

    values.config.count = ["123"];
    res = exec();
    expect(res.error).toBeDefined();

    values.config.count = true;
    res = exec();
    expect(res.error).toBeDefined();
  });
  it("Should return an error if count is smaller than 1", () => {
    values.config.count = 0;
    let res = exec();
    expect(res.error).toBeDefined();

    values.config.count = -1;
    res = exec();
    expect(res.error).toBeDefined();
  });
  it("Should return an error if count is greater than 10", () => {
    values.config.count = 11;
    let res = exec();
    expect(res.error).toBeDefined();
  });
});
