const {valLocCreate, valUserLocCreate} = require('../../../src/models/locations');

let newAddress;
let supplierName;
let adminAddPassword;
let supplierAddPassword;
let payload;
let name;
let address;

describe('locations model', () => {

  describe('valUserLocCreate', () => {
    beforeEach( () => {
      newAddress = 'string';
    });
    const exec = () => {
      const body = {
        newAddress
      }
      const {error} = valUserLocCreate(body);
      return error
    }
    it('Should return no error if all is good', () => {
      const error = exec();
      expect(error).toBeUndefined();
    });
    it('Should return an error if conditions are not met', () => {
      const testCases = [123, [1, 2, 3], true, false, undefined];
      for (const testCase of testCases){
        newAddress = testCase;
        const error = exec();
        expect(error).toBeDefined();
      }
    });
  });

  describe('valLocCreate', () => {
    beforeEach( () => {
      supplierName = 'string';
      adminAddPassword = 'string';
      supplierAddPassword = 'string';
      payload = [{ name: 'string', address: 'string'}]
    });
    const exec = () => {
      const body = {
        supplierName,
        adminAddPassword,
        supplierAddPassword,
        payload
      };
      const {error} = valLocCreate(body);
      return error;
    };
    it('Should return no error if all is good', () => {
      const error = exec();
      expect(error).toBeUndefined();
    });
    it('Should return an error if conditions are not met', () => {
      const notString = [123, [1, 2, 3], true, false];
      for(const testCase of notString) {
        supplierName = testCase;
        let error = exec();
        expect(error).toBeDefined();
        supplierName = 'string';

        adminAddPassword = testCase;
        error = exec();
        expect(error).toBeDefined();
        adminAddPassword = 'string';

        supplierAddPassword = testCase;
        error = exec();
        expect(error).toBeDefined();
        supplierAddPassword = 'string';

        payload = {name: testCase, address: 'string'};
        error = exec();
        expect(error).toBeDefined();
        payload = {name: 'string', address: testCase};
      }

      const payloadCases = ['123', 123, true, false];
      for (const testCase of payloadCases){
        payload = testCase;
        const error = exec();
        expect(error).toBeDefined();
      }
    });
  });

});