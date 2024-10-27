const request = require('supertest');
const {User} = require('../../../src/models/users');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');

let server;
let user;
let code;
let confExp;

describe('/api/confirmation', () => {

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

describe('POST /me', () => {
  beforeEach( async () => {
    email = 'goldkick7@gmail.com';
    code = '111111';
    user = new User({
      name: 'user',
      email: 'goldkick7@gmail.com',
      password: 'Aa123456',
      account: {
        isConfirmed: false,
        confCode: '111111',
        confExp: Date.now() + 100000
      },
    });
    const salt = await bcrypt.genSalt(1);
    user.password = await bcrypt.hash(user.password, salt);
    user.account.confCode = await bcrypt.hash(user.account.confCode, salt);
    await user.save();
  });
  const exec = async () => {
    return await request(server)
      .post('/api/confirmations/me')
      .send({email, code});
  };
  it('Should return 200 and set token if all is ok', async () => {
    const res = await exec();
    expect(res.status).toBe(200);
    const decoded = jwt.verify(res.headers['x-auth-token'],
      config.get('jwtPrivateKey'));
    expect(decoded._id.toString()).toBe(user.id.toString());
    const valUser = await User.findById(user.id);
    expect(valUser.account.confCode).toBeUndefined();
    expect(valUser.account.isConfirmed).toBeTruthy();
  });
  it('Should return 400 if user is already connected', async () => {
    const res = await request(server)
      .post('/api/confirmations/me')
      .set('x-auth-token', user.generateAuthToken())
      .send({email, code})
    expect(res.status).toBe(400);
  });
  it('Should return 400 if schema is not respected', async () => {
    const testCases = [123, [1, 2, 3], true, false, undefined];
    for (const testCase of testCases){
      email = testCase;
      const res = await exec();
      expect(res.status).toBe(400)
    };
    email = 'goldkick7@gmail.com'
    for (const testCase of testCases){
      code = testCase;
      const res = await exec();
      expect(res.status).toBe(400)
    };
  });
  it('Should return 401 if wrong email', async () => {
    email = 'wrong';
    const res = await exec();
    expect(res.status).toBe(401);
  });
  it('Should return 401 if code has expired', async () => {
    user.account.confExp = Date.now() - 1000;
    await user.save();
    const res = await exec();
    expect(res.status).toBe(401);
  });
  it('Should return 401 if wrong code', async () => {
    code = '999999';
    const res = await exec();
    expect(res.status).toBe(401);
  });
});
});