import userBasicInfoModifVal from '../../../../src/validation/users/userBasicInfoModifVal'

describe('userBasicInfoModifVal', () => {
  test('should validate valid name and email', () => {
    const body = {
      name: 'John Doe',
      email: 'john@example.com'
    };
    const res = userBasicInfoModifVal(body);
    expect(res.error).toBeUndefined();
  });

  test('should validate with only name', () => {
    const body = { name: 'John Doe' };
    const res = userBasicInfoModifVal(body);
    expect(res.error).toBeUndefined();
  });

  test('should validate with only email', () => {
    const body = { email: 'john@example.com' };
    const res = userBasicInfoModifVal(body);
    expect(res.error).toBeUndefined();
  });

  test('should reject invalid email', () => {
    const body = { email: 'invalid-email' };
    const res = userBasicInfoModifVal(body);
    expect(res.error).toBeDefined();
  });

  test('should reject too short name', () => {
    const body = { name: 'Jo' };
    const res = userBasicInfoModifVal(body);
    expect(res.error).toBeDefined();
  });

  test('should reject non-string name', () => {
    const body = { name: 123 };
    const res = userBasicInfoModifVal(body);
    expect(res.error).toBeDefined();
  });

  test('should reject non-string email', () => {
    const body = { email: true };
    const res = userBasicInfoModifVal(body);
    expect(res.error).toBeDefined();
  });


  test('should reject name that is too long', () => {
    const body = { name: 'a'.repeat(51) };
    const res = userBasicInfoModifVal(body);
    expect(res.error).toBeDefined();
  });


  test('should reject email without domain', () => {
    const body = { email: 'john@' };
    const res = userBasicInfoModifVal(body);
    expect(res.error).toBeDefined();
  });

  test('should reject email with spaces', () => {
    const body = { email: 'john doe@example.com' };
    const res = userBasicInfoModifVal(body);
    expect(res.error).toBeDefined();
  });

  test('should validate email with subdomain', () => {
    const body = { email: 'john@sub.example.com' };
    const res = userBasicInfoModifVal(body);
    expect(res.error).toBeUndefined();
  });
});