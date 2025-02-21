import { beforeEach, describe, expect, it } from "vitest";
import valSearch from '../../../../src/validation/items/valSearch';

describe('valSearch', () => {
  let values: any;
  beforeEach(() => {
    values = {
      config: {
        value: "test",
        categories: ["Produce", "Bio"],
        language: 'en'
      }
    }
  });
  const exec = () => {
    return valSearch(values);
  }
  it('Should return no error if everything is valid', () => {
    const res = exec();
    expect(res.error).toBeUndefined();
  });
  it('Should return an error if config is missing', () => {
    values.config = undefined;
    let res = exec();
    expect(res.error).toBeDefined();

    values.config = null;
    res = exec();
    expect(res.error).toBeDefined();

    values.otherField = 'other';
    res = exec();
    expect(res.error).toBeDefined();
  });
  it('Should return an error if value is missing', () => {
    values.config.value = undefined;
    let res = exec();
    expect(res.error).toBeDefined();

    values.config.value = null;
    res = exec();
    expect(res.error).toBeDefined();
  });
  it('Should return an error if value is not a string', () => {
    values.config.value = 123;
    let res = exec();
    expect(res.error).toBeDefined();

    values.config.value = { key: 'value' };
    res = exec();
    expect(res.error).toBeDefined();

    values.config.value = ['value'];
    res = exec();
    expect(res.error).toBeDefined();

    values.config.value = true;
    res = exec();
    expect(res.error).toBeDefined();
  });
  it('Should return an error if value is shorter than 1 character', () => {
    values.config.value = '';
    let res = exec();
    expect(res.error).toBeDefined();
  });
  it('Should return an error if value is longer than 32 characters', () => {
    values.config.value = 'a'.repeat(33);
    let res = exec();
    expect(res.error).toBeDefined();
  });
  it('Should return an error if categories is missing', () => {
    values.config.categories = undefined;
    let res = exec();
    expect(res.error).toBeDefined();

    values.config.categories = null;
    res = exec();
    expect(res.error).toBeDefined();
  });
  it('Should return an error if categories is not an array', () => {
    values.config.categories = 123;
    let res = exec();
    expect(res.error).toBeDefined();

    values.config.categories = { key: 'value' };
    res = exec();
    expect(res.error).toBeDefined();

    values.config.categories = 'value';
    res = exec();
    expect(res.error).toBeDefined();

    values.config.categories = true;
    res = exec();
    expect(res.error).toBeDefined();
  });
  it('Should return an error if categories is not an array of strings', () => {
    values.config.categories = [123];
    let res = exec();
    expect(res.error).toBeDefined();

    values.config.categories = [{ key: 'value' }];
    res = exec();
    expect(res.error).toBeDefined();

    values.config.categories = ['value', 123];
    res = exec();
    expect(res.error).toBeDefined();

    values.config.categories = ['value', { key: 'value' }];
    res = exec();
    expect(res.error).toBeDefined();
  });
  it('Should not return an error if categories is an empty array', () => {
    values.config.categories = [];
    let res = exec();
    expect(res.error).toBeUndefined();
  });
  it('Should return an error if categories contains an invalid category', () => {
    values.config.categories = ['Invalid'];
    let res = exec();
    expect(res.error).toBeDefined();
  });
  it('Should return an error if language is missing', () => {
    values.config.language = undefined;
    let res = exec();
    expect(res.error).toBeDefined();

    values.config.language = null;
    res = exec();
    expect(res.error).toBeDefined();
  });
  it('Should return an error if language is not a string', () => {
    values.config.language = 123;
    let res = exec();
    expect(res.error).toBeDefined();

    values.config.language = { key: 'value' };
    res = exec();
    expect(res.error).toBeDefined();

    values.config.language = ['value'];
    res = exec();
    expect(res.error).toBeDefined();

    values.config.language = true;
    res = exec();
    expect(res.error).toBeDefined();
  });
  it('Should return an error if language is not "en" or "fr"', () => {
    values.config.language = 'de';
    let res = exec();
    expect(res.error).toBeDefined();
  });
});
