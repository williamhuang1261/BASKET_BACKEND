const { before } = require('lodash');
const {valSupAdd, valSupGet, valSupPut, valSupDel, valSupAddItem, valSupPutItem,
  valSupDelItem, valSupDelItemPrice,
  Supplier} = require('../../../src/models/suppliers');
const fs = require('fs');

let adminAddPassword;
let adminUpdatePassword;
let adminDeletePassword;
let supplierAddPassword;
let supplierUpdatePassword;
let supplierDeletePassword;


let supplierName;
let logo;
let name;
let code;
let priceDelIndex;
let pricing;


describe('suppliers model', () => {

describe('valSupAdd', () => {
  beforeEach( () => {
    adminAddPassword = 'adminAdd';
    supplierName = 'Company';
    logo = fs.readFileSync('./tests/test_images/Logo_blank.png');
  });
  const exec = () => {
    const body = {
      adminAddPassword: adminAddPassword,
      supplierName: supplierName,
      logo: logo
    }
    const {error} = valSupAdd(body);
    return error;
  };
  it('Should return no error if all is ok', async () => {
    const error = exec();
    expect(error).toBeUndefined();
  });
  it('Should return an error if schema is not respected', () => {
    const passwordCases = [123, [1, 2, 3], true, false, undefined];
    for (const e of passwordCases) {
      adminAddPassword = e;
      const error = exec();
      expect(error).toBeDefined();
    }

    const supplierNameCases = ['12', `${Array(52).join('a')}`, 123, [1, 2, 3],
      true, false, undefined];
    for (const e of supplierNameCases) {
      supplierName = e;
      const error = exec();
      expect(error).toBeDefined();
    }

    const logoCases = ['12', [1, 0], 12, true, false, undefined];
    for (const e of logoCases) {
      logo = e;
      const error = exec();
      expect(error).toBeDefined();
    }
  });

});

describe('valSupGet', () => {
  beforeEach( () => {
    supplierName = 'Company';
  });
  const exec = () => {
    const body = {
      supplierName: supplierName,
    }
    const {error} = valSupGet(body);
    return error;
  };
  it('Should return no error if all is ok', async () => {
    const error = exec();
    expect(error).toBeUndefined();
  });
  it('Should return an error if schema is not respected', () => {
    const supplierNameCases = [123, [1, 2, 3], true, false, undefined];
    for (const e of supplierNameCases) {
      supplierName = e;
      const error = exec();
      expect(error).toBeDefined();
    }
  });

});

describe('valSupPut', () => {
  beforeEach( () => {
    adminUpdatePassword = 'adminUpdate';
    supplierUpdatePassword = 'supplierUpdate';
    supplierName = 'Company';
    name = 'New Company Name';
    logo = fs.readFileSync('./tests/test_images/Logo_blank.png');
  });
  const exec = () => {
    const body = {
      adminUpdatePassword: adminUpdatePassword,
      supplierUpdatePassword: supplierUpdatePassword,
      name: name,
      supplierName: supplierName,
      logo: logo
    }
    const {error} = valSupPut(body);
    return error;
  };
  it('Should return no error if all is ok', async () => {
    const error = exec();
    expect(error).toBeUndefined();
  });
  it('Should return an error if schema is not respected', () => {
    const passwordCases = [123, [1, 2, 3], true, false];
    for (const e of passwordCases) {
      adminUpdatePassword = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    adminUpdatePassword = 'adminUpdate';
    for (const e of passwordCases) {
      supplierUpdatePassword = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    supplierUpdatePassword = 'supplierUpdate'

    const supplierNameCases = [123, [1, 2, 3], true, false];
    for (const e of supplierNameCases) {
      supplierName = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    supplierName = 'Company'

    const nameCases = ['12', `${Array(52).join('a')}` ,123, [1, 2, 3],
      true, false];
    for (const e of nameCases) {
      name = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    name = 'Company';

    const logoCases = [[1, 0], 12, true, false];
    for (const e of logoCases) {
      logo = e;
      const error = exec();
      expect(error).toBeDefined();
    }
  });

});

describe('valSupDel', () => {
  beforeEach( () => {
    adminDeletePassword= 'adminDelete';
  });
  const exec = () => {
    const body = {
      adminDeletePassword: adminDeletePassword,
    }
    const {error} = valSupDel(body);
    return error;
  };
  it('Should return no error if all is ok', async () => {
    const error = exec();
    expect(error).toBeUndefined();
  });
  it('Should return an error if schema is not respected', () => {
    const supplierNameCases = [123, [1, 2, 3], true, false, undefined];
    for (const e of supplierNameCases) {
      adminDeletePassword = e;
      const error = exec();
      expect(error).toBeDefined();
    }
  });

});

describe('valSupAddItem', () => {
  beforeEach( () => {
    supplierAddPassword = 'supplierAdd'
    adminAddPassword = 'adminAdd'
    supplierName = 'Company'
    code = '12345'
    pricing = {
      normal: 1.02,
      method: 'weight_kg',
      limited: {
        typeOfRebate:'buyXgetYforC',
        X: 1,
        Y: 1,
        C: 0.51,
        rebatePricing: 'unit',
        start: Date.now(),
        end: Date.now(),
        onlyMembers: true
      }
    }
  });
  const exec = () => {
    const body = {
      supplierAddPassword: supplierAddPassword,
      adminAddPassword: adminAddPassword,
      supplierName: supplierName,
      code: code,
      pricing: pricing
    }
    const {error} = valSupAddItem(body);
    return error;
  };
  it('Should return no error if all is ok', async () => {
    const error = exec();
    expect(error).toBeUndefined();
  });
  it('Should return an error if schema is not respected', () => {
    const passwordCases = [123, [1, 2, 3], true, false];
    for (const e of passwordCases) {
      adminAddPassword = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    adminAddPassword = 'adminAdd';
    for (const e of passwordCases) {
      supplierAddPassword = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    supplierAddPassword = 'adminAdd';

    const supplierNameCases = [123, [1, 2, 3], true, false];
    for (const e of supplierNameCases) {
      supplierName = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    supplierName = 'supplierName';

    const codeCases = [123, [1, 2, 3], true, false, undefined];
    for (const e of codeCases) {
      code = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    code = '12345';

    const pricingCases = [{}, undefined, '1'];
    for (const e of pricingCases) {
      pricing = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    pricing = {
      normal: 1.02,
      method: 'weight_kg',
      limited: {
        typeOfRebate:'buyXgetYforC',
        X: 1,
        Y: 1,
        C: 0.51,
        start: Date.now(),
        end: Date.now()
      }
    }

    const price_normal_cases = ['a', true, false, [1.20], undefined];
    for (const e of price_normal_cases) {
      pricing.normal = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    pricing.normal = 12;
    const price_method_cases = ['1', 12, ['unit'], true, false, undefined];
    for (const e of price_method_cases) {
      pricing.method = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    pricing.method = 'unit';

    pricing.limited = {};
    const error = exec();
    expect(error).toBeDefined();
    pricing.limited = {
      typeOfRebate:'buyXgetYforC',
      X: 1,
      Y: 1,
      C: 0.51,
      start: Date.now(),
      end: Date.now()
    };
    const lim_type_cases = ['1', 1, ['C'], true, false, undefined];
    for (const e of lim_type_cases) {
      pricing.limited.typeOfRebate = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    pricing.limited.typeOfRebate = 'C';
    const lim_X_Y_cases = ['1.2', 1.2, [1.2], true, false];
    for (const e of lim_X_Y_cases) {
      pricing.limited.X = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    pricing.limited.X = undefined;
    for (const e of lim_X_Y_cases) {
      pricing.limited.Y = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    pricing.limited.Y = undefined;
    const lim_C_cases = ['a', [1.2], true, false, undefined];
    for (const e of lim_C_cases) {
      pricing.limited.C = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    pricing.limited.C = 1;
    const lim_date_cases = ['a', [1], true, false, undefined];
    for (const e of lim_date_cases) {
      pricing.limited.start = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    pricing.limited.start = Date.now();
    for (const e of lim_date_cases) {
      pricing.limited.end = e;
      const error = exec();
      expect(error).toBeDefined();
    }
  });
});

describe('valSupPutItem', () => {
  beforeEach( () => {
    supplierUpdatePassword = 'supplierUpdate'
    adminUpdatePassword = 'adminUpdate'
    supplierName = 'Company'
    code = '12345'
    pricing = {
      normal: 1.02,
      method: 'weight_kg',
      limited: {
        typeOfRebate:'buyXgetYforC',
        X: 1,
        Y: 1,
        C: 0.51,
        rebatePricing: 'unit',
        start: Date.now(),
        end: Date.now(),
        onlyMembers: true
      }
    }
  });
  const exec = () => {
    const body = {
      supplierUpdatePassword: supplierUpdatePassword,
      adminUpdatePassword: adminUpdatePassword,
      supplierName: supplierName,
      code: code,
      pricing: pricing
    }
    const {error} = valSupPutItem(body);
    return error;
  };
  it('Should return no error if all is ok', async () => {
    const error = exec();
    expect(error).toBeUndefined();
  });
  it('Should return an error if schema is not respected', () => {
    const passwordCases = [123, [1, 2, 3], true, false];
    for (const e of passwordCases) {
      adminUpdatePassword = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    adminUpdatePassword = 'adminUpdate';
    for (const e of passwordCases) {
      supplierUpdatePassword = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    supplierUpdatePassword = 'adminUpdate';

    const supplierNameCases = [123, [1, 2, 3], true, false];
    for (const e of supplierNameCases) {
      supplierName = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    supplierName = 'supplierName';

    const codeCases = [123, [1, 2, 3], true, false, undefined];
    for (const e of codeCases) {
      code = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    code = '12345';

    const pricingCases = ['1'];
    for (const e of pricingCases) {
      pricing = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    pricing = {
      normal: 1.02,
      method: 'weight_kg',
      limited: {
        typeOfRebate:'buyXgetYforC',
        X: 1,
        Y: 1,
        C: 0.51,
        start: Date.now(),
        end: Date.now()
      }
    }

    const price_normal_cases = ['a', true, false, [1.20]];
    for (const e of price_normal_cases) {
      pricing.normal = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    pricing.normal = 12;
    const price_method_cases = ['1', 12, ['unit'], true, false];
    for (const e of price_method_cases) {
      pricing.method = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    pricing.method = 'unit';

    pricing.limited = {};
    const error = exec();
    expect(error).toBeDefined();
    pricing.limited = {
      typeOfRebate:'buyXgetYforC',
      X: 1,
      Y: 1,
      C: 0.51,
      start: Date.now(),
      end: Date.now()
    };
    const lim_type_cases = ['1', 1, ['C'], true, false, undefined];
    for (const e of lim_type_cases) {
      pricing.limited.typeOfRebate = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    pricing.limited.typeOfRebate = 'C';
    const lim_X_Y_cases = ['1.2', 1.2, [1.2], true, false];
    for (const e of lim_X_Y_cases) {
      pricing.limited.X = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    pricing.limited.X = undefined;
    for (const e of lim_X_Y_cases) {
      pricing.limited.Y = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    pricing.limited.Y = undefined;
    const lim_C_cases = ['a', [1.2], true, false, undefined];
    for (const e of lim_C_cases) {
      pricing.limited.C = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    pricing.limited.C = 1;
    const lim_date_cases = ['a', [1], true, false, undefined];
    for (const e of lim_date_cases) {
      pricing.limited.start = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    pricing.limited.start = Date.now();
    for (const e of lim_date_cases) {
      pricing.limited.end = e;
      const error = exec();
      expect(error).toBeDefined();
    }
  });
});

describe('valSupDelItem', () => {
  beforeEach( () => {
    adminDeletePassword = 'adminDelete';
    supplierDeletePassword = 'supplierDelete';
    supplierName = 'Company';
    code = '12345'
  });
  const exec = () => {
    const body = {
      adminDeletePassword: adminDeletePassword,
      supplierDeletePassword: supplierDeletePassword,
      supplierName: supplierName,
      code: code
    }
    const {error} = valSupDelItem(body);
    return error;
  };
  it('Should return no error if all is ok', async () => {
    const error = exec();
    expect(error).toBeUndefined();
  });
  it('Should return an error if schema is not respected', () => {
    const passwordCases = [123, [1, 2, 3], true, false];
    for (const e of passwordCases) {
      adminDeletePassword = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    for (const e of passwordCases) {
      supplierDeletePassword = e;
      const error = exec();
      expect(error).toBeDefined();
    }

    const supplierNameCases = [123, [1, 2, 3], true, false];
    for (const e of supplierNameCases) {
      supplierName = e;
      const error = exec();
      expect(error).toBeDefined();
    }

    const codeCases = [123, [1, 2, 3], true, false, undefined];
    for (const e of codeCases) {
      code = e;
      const error = exec();
      expect(error).toBeDefined();
    }
  });
});

describe('valSupDelItemPrice', () => {
  beforeEach( () => {
    adminDeletePassword = 'adminDelete';
    supplierDeletePassword = 'supplierDelete';
    supplierName = 'Company';
    code = '12345';
    priceDelIndex = 1;
  });
  const exec = () => {
    const body = {
      adminDeletePassword: adminDeletePassword,
      supplierDeletePassword: supplierDeletePassword,
      supplierName: supplierName,
      code: code,
      priceDelIndex: priceDelIndex
    }
    const {error} = valSupDelItemPrice(body);
    return error;
  };
  it('Should return no error if all is ok', async () => {
    const error = exec();
    expect(error).toBeUndefined();
  });
  it('Should return an error if schema is not respected', () => {
    const passwordCases = [123, [1, 2, 3], true, false];
    for (const e of passwordCases) {
      adminDeletePassword = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    for (const e of passwordCases) {
      supplierDeletePassword = e;
      const error = exec();
      expect(error).toBeDefined();
    }

    const supplierNameCases = [123, [1, 2, 3], true, false];
    for (const e of supplierNameCases) {
      supplierName = e;
      const error = exec();
      expect(error).toBeDefined();
    }

    const codeCases = [123, [1, 2, 3], true, false, undefined];
    for (const e of codeCases) {
      code = e;
      const error = exec();
      expect(error).toBeDefined();
    }

    const priceDelIndexCases = ['1', 1.2, [1], true, false, undefined];
    for (const e of priceDelIndexCases) {
      priceDelIndex = e;
      const error = exec();
      expect(error).toBeDefined();
    }
  });
});

})