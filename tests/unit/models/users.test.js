const {User, valUserCreation, valUserLogging, valUserModif,
  validateUserUpdateByAdmin, valAuthModify, valAuthCreate,
  valAuthDel} = require('../../../src/models/users');
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');
const winston = require('winston');

let name;
let email;
let password;
let oldPassword;
let isAdmin;
let isSupplier;

let adminAddPassword;
let adminUpdatePassword;
let adminDeletePassword;
let adminGetPassword;
let supplierAddPassword;
let supplierUpdatePassword;
let supplierDeletePassword;
let supplierGetPassword;
let supplierName;
let newSupplierAddPassword;
let newSupplierUpdatePassword;
let newSupplierDeletePassword;
let newSupplierGetPassword;

describe('users.js functions', () => {

  beforeEach( () => {
    name = 'Bob';
    email = 'abc@gmail.com';
    password = 'Aa123456';
    oldPassword = '123456Aa';
    adminUpdatePassword = 'adminUpdate';
    isAdmin = false;
    isSupplier = false;
  });

  describe('user.generateAuthToken', () => {
    it('Should return a valid JWT', () => {
      const payload = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        isAdmin: false,
        isSupplier: false
      };
      const user = new User(payload);
      const token = user.generateAuthToken();
      const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
      expect(decoded).toMatchObject(payload);
    });
  });
  
  describe('valUserCreation', () => {
    const exec = () => {
      const user = {
        name: name,
        email: email,
        password: password
      }
      const {error} = valUserCreation(user)
      return error
    };

    it('Should return no error if all conditions are respected', () => {
      const error = exec();
      expect(error).not.toBeDefined();
    });
    it('Should return an error if some conditions are not respected', () => {
      const nameCases = ['Ab', 123, Array(32).join('a'), true, false,
        [1, 2, 3]];
      for (const nameCase in nameCases){
        name = nameCase;
        const error = exec();
        expect(error).toBeDefined();
      }
      name = 'Bob';
  
      const emailCases = [`${Array(30).join('a')}@${Array(189).join('a')}.ca`,
          '123', 'a@c', 12345, [1, 2, 3, 4 , 5], true, false];
      for (const emailCase of emailCases) {
        email = emailCase;
        const error = exec();
        expect(error).toBeDefined();
      }
      email = 'abc@gmail.com';
  
      const passwordCases = ['Aa12345', `Aa${Array(1024).join('a')}`,
          'aa123456', 'AA123456', '  ', 'Ö', 12345678, [1, 2, 3, 4, 5, 6, 7, 8],
          true, false];
      for (const passwordCase of passwordCases) {
        password = passwordCase;
        const error = exec();
        expect(error).toBeDefined();
      }
      password = 'Aa123456'
    });
  });
  
  describe('valUserLogging', () => {
    const exec = () => {
      const user = {
        email: email,
        password: password,
      }
      const {error} = valUserLogging(user)
      return error
    };
  
    it('Should return no error if the email and password are strings', () => {
      const error = exec();
      expect(error).not.toBeDefined();
    });
    it('Should return an error if conditions are not respected', () => {
      const emailCases = [12345, [1, 2, 3, 4 , 5], true, false];
      for (const emailCase of emailCases) {
        email = emailCase;
        const error = exec();
        expect(error).toBeDefined();
      }
      email = 'abc@gmail.com';
  
      const passwordCases = [12345678, [1, 2, 3, 4, 5, 6, 7, 8], true, false];
      for (const passwordCase of passwordCases) {
        password = passwordCase;
        const error = exec();
        expect(error).toBeDefined();
      }
      password = 'Aa123456'

    });
  });

  describe('valUserModif', () => {
    const exec = () => {
      const user = {
        name: name,
        email: email,
        password: password,
        oldPassword: oldPassword,
      }
      const {error} = valUserModif(user)
      return error
    };
    
    it('Should return no error if all conditions are respected', () => {
      const error = exec();
      expect(error).not.toBeDefined();
    });
    it('Should return an error if some conditions are not respected', () => {
      const nameCases = ['Ab', 123, Array(32).join('a'), true, false,
        [1, 2, 3]];
      for (const nameCase in nameCases){
        name = nameCase;
        const error = exec();
        expect(error).toBeDefined();
      }
      name = 'Bob';
  
      const emailCases = [`${Array(30).join('a')}@${Array(189).join('a')}.ca`,
          '123', 'a@c', 12345, [1, 2, 3, 4 , 5], true, false];
      for (const emailCase of emailCases) {
        email = emailCase;
        const error = exec();
        expect(error).toBeDefined();
      }
      email = 'abc@gmail.com';
  
      const passwordCases = ['Aa12345', `Aa${Array(1024).join('a')}`,
          'aa123456', 'AA123456', '  ', 'Ö', 12345678, [1, 2, 3, 4, 5, 6, 7, 8],
          true, false];
      for (const passwordCase of passwordCases) {
        password = passwordCase;
        const error = exec();
        expect(error).toBeDefined();
      }
      password = 'Aa123456';

      const oldPasswordCases = [12345678, [1, 2, 3,4 ,5 , 6, 7, 8], undefined,
        true, false];
      for (const oldPasswordCase of oldPasswordCases){
        oldPassword = oldPasswordCase;
        const error = exec();
        expect(error).toBeDefined();
      }
      oldPassword = 'Aa123456';
    });
  });

  describe('validateUserUpdateByAdmin', () => {
    const exec = () => {
      const user = {
        name : name,
        email : email, 
        password : password,
        adminUpdatePassword : adminUpdatePassword,
        isAdmin : isAdmin,
        isSupplier : isSupplier
      };
      const {error} = validateUserUpdateByAdmin(user);
      return error;
    };

    it('Should return no error if all conditions are respected', () => {
      const error = exec();
      expect(error).not.toBeDefined();
    });
    it('Should return an error if some conditions are not respected', () => {
      const nameCases = ['Ab', 123, Array(32).join('a'), true, false,
        [1, 2, 3]];
      for (const nameCase in nameCases){
        name = nameCase;
        const error = exec();
        expect(error).toBeDefined();
      }
      name = 'Bob';
  
      const emailCases = [`${Array(30).join('a')}@${Array(189).join('a')}.ca`,
          '123', 'a@c', 12345, [1, 2, 3, 4 , 5], true, false];
      for (const emailCase of emailCases) {
        email = emailCase;
        const error = exec();
        expect(error).toBeDefined();
      }
      email = 'abc@gmail.com';
  
      const passwordCases = ['Aa12345', `Aa${Array(1024).join('a')}`,
          'aa123456', 'AA123456', '  ', 'Ö', 12345678, [1, 2, 3, 4, 5, 6, 7, 8],
          true, false];
      for (const passwordCase of passwordCases) {
        password = passwordCase;
        const error = exec();
        expect(error).toBeDefined();
      }
      password = 'Aa123456';

      const adminPassword = [12345, [1, 2, 3, 4], true, false]
      for (const testCase of adminPassword) {
        adminUpdatePassword = testCase;
        const error = exec();
        expect(error).toBeDefined();
      }

      const booleanCase = ['0', '1', 0, 1, [0], [1]]
      for (const testCase of booleanCase){
        isAdmin = testCase;
        isSupplier = testCase;
        const error = exec();
        expect(error).toBeDefined();
      }
    });
  });

  describe('valAuthModify', () => {
    beforeEach(() => {
      supplierAddPassword = 'supplierAdd';
      supplierUpdatePassword = 'supplierUpdate';
      supplierDeletePassword = 'supplierDelete';
      supplierGetPassword = 'supplierGet';
      newSupplierAddPassword = 'AAaa12$$90';
      newSupplierUpdatePassword = 'AAaa12$$90';
      newSupplierDeletePassword = 'AAaa12$$90';
      newSupplierGetPassword = 'AAaa12$$90';
    });
    const exec = () => {
      const body = {
        supplierAddPassword,
        supplierUpdatePassword,
        supplierDeletePassword,
        supplierGetPassword,
        newSupplierAddPassword,
        newSupplierUpdatePassword,
        newSupplierDeletePassword,
        newSupplierGetPassword
      }
      const {error} = valAuthModify(body);
      return error;
    };
    it('Should return no error if all data respects conditions', async () => {
      const error = exec();
      expect(error).toBeUndefined();
    });
    it('Should return an error if some data do not respect conditions',
    async () => {
      const notStringCases = [123, [1, 2, 3], true, false, undefined];
      for(const testCase of notStringCases){
        supplierAddPassword = testCase
        let error = exec();
        expect(error).toBeDefined();
        supplierAddPassword = 'supplierAdd';

        supplierUpdatePassword = testCase
        error = exec();
        expect(error).toBeDefined();
        supplierUpdatePassword = 'supplierUpdate';

        supplierDeletePassword = testCase
        error = exec();
        expect(error).toBeDefined();
        supplierDeletePassword = 'supplierDelete';

        supplierGetPassword = testCase
        error = exec();
        expect(error).toBeDefined();
        supplierGetPassword = 'supplierGet';
      }

      const invalidPasswords = [1234567890, [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        true, false, 'AAaa12$$9', `AAaa12$$${Array(122).join('a')}`,
        'AAaa123$90', 'AAAa12$$90', 'Aaaa12$$90', 'AAaa1$$$aa', 'AAaa12 $$90'];
      for (const testCase of invalidPasswords){
        newSupplierAddPassword = testCase;
        let error = exec();
        expect(error).toBeDefined();
        newSupplierAddPassword = 'AAaa12$$90';

        newSupplierUpdatePassword = testCase;
        error = exec();
        expect(error).toBeDefined();
        newSupplierUpdatePassword = 'AAaa12$$90';

        newSupplierDeletePassword = testCase;
        error = exec();
        expect(error).toBeDefined();
        newSupplierDeletePassword = 'AAaa12$$90';

        newSupplierGetPassword = testCase;
        error = exec();
        expect(error).toBeDefined();
        newSupplierGetPassword = 'AAaa12$$90';
      }
    });
  });

  describe('valAuthCreate', () => {
    beforeEach( () => {
      adminAddPassword = 'adminAdd';
      adminUpdatePassword = 'adminUpdate';
      adminDeletePassword = 'adminDelete';
      adminGetPassword = 'adminGet';
      supplierAddPassword = 'AAaa12$$90';
      supplierUpdatePassword = 'AAaa12$$90';
      supplierDeletePassword = 'AAaa12$$90';
      supplierGetPassword = 'AAaa12$$90';
      supplierName = 'supplier';
    });
    const exec = () => {
      const body = {
        adminAddPassword,
        adminUpdatePassword,
        adminDeletePassword,
        adminGetPassword,
        supplierAddPassword,
        supplierUpdatePassword,
        supplierDeletePassword,
        supplierGetPassword,
        supplierName
      };
      const {error} = valAuthCreate(body);
      return error;
    };
    it('Should return no error if all data respects conditions', async () => {
      const error = exec();
      expect(error).toBeUndefined();
    });
    it('Should return an error if some data do not respect conditions',
    async () => {
      const notStringCases = [123, [1, 2, 3], true, false, undefined];
      for(const testCase of notStringCases){
        adminAddPassword = testCase;
        let error = exec();
        expect(error).toBeDefined();
        adminAddPassword = 'adminAdd';

        adminUpdatePassword = testCase;
        error = exec();
        expect(error).toBeDefined();
        adminUpdatePassword = 'adminUpdate';

        adminDeletePassword = testCase;
        error = exec();
        expect(error).toBeDefined();
        adminDeletePassword = 'adminDelete';

        adminGetPassword = testCase;
        error = exec();
        expect(error).toBeDefined();
        adminGetPassword = 'adminGet';

        supplierName = testCase;
        error = exec();
        expect(error).toBeDefined();
      }

      const invalidPasswords = [1234567890, [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        true, false, 'AAaa12$$9', `AAaa12$$${Array(122).join('a')}`,
        'AAaa123$90', 'AAAa12$$90', 'Aaaa12$$90', 'AAaa1$$$aa', 'AAaa12 $$90'];
      for (const testCase of invalidPasswords){
        supplierAddPassword = testCase;
        let error = exec();
        expect(error).toBeDefined();
        supplierAddPassword = 'AAaa12$$90';

        supplierUpdatePassword = testCase;
        error = exec();
        expect(error).toBeDefined();
        supplierUpdatePassword = 'AAaa12$$90';

        supplierDeletePassword = testCase;
        error = exec();
        expect(error).toBeDefined();
        supplierDeletePassword = 'AAaa12$$90';

        supplierGetPassword = testCase;
        error = exec();
        expect(error).toBeDefined();
        supplierGetPassword = 'AAaa12$$90';
      }
    });
  });

  describe('valAuthDel', () => {
    beforeEach(() => {
      adminAddPassword = 'adminAdd';
      adminUpdatePassword = 'adminUpdate';
      adminDeletePassword = 'adminDelete';
      adminGetPassword = 'adminGet';
    });
    const exec = () => {
      const body = {
        adminAddPassword,
        adminUpdatePassword,
        adminDeletePassword,
        adminGetPassword,
      }
      const {error} = valAuthDel(body);
      return error;
    };
    it('Should return no error if all data respects conditions', async () => {
      const error = exec();
      expect(error).toBeUndefined();
    });
    it('Should return an error if some data do not respect conditions',
    async () => {
      const notStringCases = [123, [1, 2, 3], true, false, undefined];
      for(const testCase of notStringCases){
        adminAddPassword = testCase
        let error = exec();
        expect(error).toBeDefined();
        adminAddPassword = 'adminAdd';

        adminUpdatePassword = testCase
        error = exec();
        expect(error).toBeDefined();
        adminUpdatePassword = 'adminUpdate';

        adminDeletePassword = testCase
        error = exec();
        expect(error).toBeDefined();
        adminDeletePassword = 'adminDelete';

        adminGetPassword = testCase
        error = exec();
        expect(error).toBeDefined();
        adminGetPassword = 'adminGet';
      }
    });
  });
});