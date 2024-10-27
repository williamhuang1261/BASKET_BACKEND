const request = require('supertest');
const {User} = require('../../../src/models/users');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');

let server;
let user;
let email;
let password;

describe('/api/logIn', () => {

beforeEach(async () => {
  server = require('../../../src/index');
  await server.close();
});
afterEach(async ()=> {
  await User.deleteMany({});
});
afterAll(async () => {
  mongoose.disconnect();
  await server.close();
});

describe('POST /', () => {
  beforeEach( async () => {
    email = 'goldkick7@gmail.com';
    password = 'Aa123456';
    user = new User({
      name: 'user',
      email: 'goldkick7@gmail.com',
      password: 'Aa123456',
      account: {
        isConfirmed: true
      }
    });
    const salt = await bcrypt.genSalt(1);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
  });
  const exec = async () => {
    return await request(server)
      .post('/api/login/')
      .send({email, password});
  };
  it('Should return 200 if all is ok', async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });
  it('Should return 200 and send email if user did not confirm his account',
  async () => {
    user.account.isConfirmed = false;
    await user.save();
    const res = await exec();
    expect(res.status).toBe(200);
    const valUser = await User.findById(user.id);
    expect(valUser.account.confCode).toBeDefined();
  });
  it('Should return 200 and email if user is supplier or admin', async () => {
    user.account.isAdmin = true;
    await user.save();
    let res = await exec();
    expect(res.status).toBe(200);
    let valUser = await User.findById(user.id);
    expect(valUser.account.confCode).toBeDefined();
    user.account.isAdmin = false;
    user.account.isSupplier = true;
    await user.save();
    res = await exec();
    expect(res.status).toBe(200);
    expect(valUser.account.confCode).toBeDefined();
  });
  it('Should return 400 if the user is already logged in', async () => {
    const res = await request(server)
      .post('/api/login/')
      .set('x-auth-token', user.generateAuthToken())
      .send({email, password});
    expect(res.status).toBe(400);
  });
  it('Should return 400 if schema is not respected', async () => {
    const testCases = [123, [1, 2, 3], true, false, undefined];

    for (const testCase of testCases){
      email = testCase;
      const res = await exec();
      expect(res.status).toBe(400);
    }
    email = 'goldkick7@gmail.com';

    for(const testCase of testCases){
      password = testCase;
      const res = await exec();
      expect(res.status).toBe(400);
    }
  });
  it('Should return 401 if email does not exist', async () => {
    email = 'wrong';
    const res = await exec();
    expect(res.status).toBe(401);
  });
  it('Should return 401 if password is invalid', async () => {
    password = 'wrong';
    const res = await exec();
    expect(res.status).toBe(401);
  });
});

});
