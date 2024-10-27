const {valItemCreate, valItemModif,
  valItemDelete} = require('../../../src/models/items');
const fs = require('fs');

let adminAddPassword;
let adminUpdatePassword;
let adminDeletePassword;

let name;
let ref;
let amount;
let description;
let brand;
let tags;
let image;

describe('item model', () => {

describe('valItemCreate', () => {
  beforeEach( () => {
    adminAddPassword = 'adminAdd';
    name = {
      fr: 'nom',
      en: 'name',
      size: 'S'
    };
    ref = {
      standard: 'PLU',
      code: '12345'
    };
    amount = {
      isApprox: true,
      meas: 'weight',
      units: 'mg',
      quantity: 10
    };
    description = 'string';
    brand = 'string';
    tags = ['Produce', 'Health Foods'];
    image = fs.readFileSync('./tests/test_images/Logo_blank.png');
  });
  const exec = () => {
    const body = {
      adminAddPassword: adminAddPassword,
      name: name,
      ref: ref,
      amount: amount,
      description: description,
      brand: brand,
      tags: tags,
      image: image
    }
    const {error} = valItemCreate(body);
    return error;
  };
  it('Should return no error if all is ok', async () => {
    const error = exec();
    expect(error).toBeUndefined();
  });
  it('Should return an error if schema is not respected', async () => {
    const passwordCases = [123, [1, 2, 3], true, false, undefined];
    for (const e of passwordCases) {
      adminAddPassword = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    adminAddPassword = 'adminAdd'

    const nameCases = [{}, undefined, '123', 123, true, false];
    for (const e of nameCases) {
      name = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    name = {
      fr: 'nom',
      en: 'name',
      size: 'S'
    };
    const name_lan_cases = ['12', `${Array(252).join('a')}`, 123, [1, 2, 3],
      true, false, undefined];
    for (const e of name_lan_cases) {
      name.fr = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    name.fr = 'nom';
    for (const e of name_lan_cases) {
      name.en = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    name.end = 'name'
    const name_size_cases = [123, '123', ['S'], true, false, undefined];
    for (const e of name_size_cases) {
      name.size = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    name.size = 'S'

    const refCases = [{}, undefined, '123', 123, true, false];
    for (const e of refCases) {
      ref = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    ref = {
      standard: 'PLU',
      code: '12345'
    };
    const ref_standard_cases = ['1', 1, ['PLU'], true, false, undefined];
    for (const e of ref_standard_cases) {
      ref.standard = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    ref.standard = 'PLU'
    const ref_code_cases = ['a', 123, ['1'], true, false, undefined];
    for (const e of ref_code_cases) {
      ref.code = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    ref.code = '12345'

    const amountCases = [{}, undefined, '1'];
    for (e of amountCases) {
      amount = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    amount = {
      isApprox: true,
      meas: 'weight',
      units: 'mg',
      quantity: 10
    };
    const amount_isApprox_cases = ['1', 1, [1], ['1'], undefined];
    for (e of amount_isApprox_cases) {
      amount.isApprox = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    amount.isApprox = true;
    const amount_meas_cases = ['1', 1, ['volume'], true, false, undefined];
    for (e of amount_meas_cases) {
      amount.meas = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    amount.meas = 'weight';
    const amount_units_cases = ['1', 1, ['mg'], true, false, undefined];
    for (e of amount_units_cases) {
      amount.units = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    amount.units = 'mg';
    const amount_quantity_cases = ['1', [1], true, false, undefined];
    for (e of amount_quantity_cases) {
      amount.quantity = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    amount.quantity = 1;

    const desCases = [123, ['123'], true, false];
    for (e of desCases) {
      description = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    description = 'string';

    const brandCases = ['1', `${Array(252).join('a')}`, 123, ['123'], true,
      false];
    for (e of brandCases) {
      brand = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    brand = 'string';

    const tagsCases = ['Produce', 123, ['wrong', 'Produce'], [true], [false], []];
    for (e of tagsCases) {
      tags = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    tags = ['Produce'];

    const imageCases = [[1, 0], undefined, true, false, 12];
    for (e of imageCases) {
      image = e;
      const error = exec();
      expect(error).toBeDefined();
    }
  });
});

describe('valItemModif', () => {
  beforeEach( () => {
    adminUpdatePassword = 'adminUpdate';
    name = {
      fr: 'nom',
      en: 'name',
      size: 'S'
    };
    ref = {
      standard: 'PLU',
      code: '12345'
    };
    amount = {
      isApprox: true,
      meas: 'weight',
      units: 'mg',
      quantity: 10
    };
    description = 'string';
    brand = 'string';
    tags = ['Produce', 'Health Foods'];
    image = fs.readFileSync('./tests/test_images/Logo_blank.png');
  });
  const exec = () => {
    const body = {
      adminUpdatePassword: adminUpdatePassword,
      name: name,
      ref: ref,
      amount: amount,
      description: description,
      brand: brand,
      tags: tags,
      image: image
    }
    const {error} = valItemModif(body);
    return error;
  };
  it('Should return no error if all is ok', async () => {
    const error = exec();
    expect(error).toBeUndefined();
  });
  it('Should return an error if schema is not respected', async () => {
    const passwordCases = [123, [1, 2, 3], true, false];
    for (const e of passwordCases) {
      adminUpdatePassword = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    adminUpdatePassword = 'adminUpdate'

    const nameCases = ['123', 123, true, false];
    for (const e of nameCases) {
      name = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    name = {
      fr: 'nom',
      en: 'name',
      size: 'S'
    };
    const name_lan_cases = ['12', `${Array(252).join('a')}`, 123, [1, 2, 3],
      true, false];
    for (const e of name_lan_cases) {
      name.fr = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    name.fr = 'nom';
    for (const e of name_lan_cases) {
      name.en = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    name.end = 'name'
    const name_size_cases = [123, '123', ['S'], true, false];
    for (const e of name_size_cases) {
      name.size = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    name.size = 'S'

    const refCases = [{}, '123', 123, true, false];
    for (const e of refCases) {
      ref = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    ref = {
      standard: 'PLU',
      code: '12345'
    };
    const ref_standard_cases = ['1', 1, ['PLU'], true, false];
    for (const e of ref_standard_cases) {
      ref.standard = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    ref.standard = 'PLU'
    const ref_code_cases = ['a', 123, ['1'], true, false];
    for (const e of ref_code_cases) {
      ref.code = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    ref.code = '12345'

    const amountCases = [{}, '1'];
    for (e of amountCases) {
      amount = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    amount = {
      isApprox: true,
      meas: 'weight',
      units: 'mg',
      quantity: 10
    };
    const amount_isApprox_cases = ['1', 1, [1], ['1']];
    for (e of amount_isApprox_cases) {
      amount.isApprox = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    amount.isApprox = true;
    const amount_meas_cases = ['1', 1, ['volume'], true, false];
    for (e of amount_meas_cases) {
      amount.meas = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    amount.meas = 'weight';
    const amount_units_cases = ['1', 1, ['mg'], true, false];
    for (e of amount_units_cases) {
      amount.units = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    amount.units = 'mg';
    const amount_quantity_cases = ['1', [1], true, false];
    for (e of amount_quantity_cases) {
      amount.quantity = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    amount.quantity = 1;

    const desCases = [123, ['123'], true, false];
    for (e of desCases) {
      description = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    description = 'string';

    const brandCases = ['1', `${Array(252).join('a')}`, 123, ['123'], true,
      false];
    for (e of brandCases) {
      brand = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    brand = 'string';

    const tagsCases = ['Produce', 123, ['wrong', 'Produce'], [true], [false], []];
    for (e of tagsCases) {
      tags = e;
      const error = exec();
      expect(error).toBeDefined();
    }
    tags = ['Produce'];

    const imageCases = [[1, 0], true, false, 12];
    for (e of imageCases) {
      image = e;
      const error = exec();
      expect(error).toBeDefined();
    }
  });
});

describe('valItemDelete', () => {
  beforeEach ( () => {
    adminDeletePassword = 'adminDelete';
  });
  const exec = () => {
    const body = {
      adminDeletePassword: adminDeletePassword,
    }
    const {error} = valItemDelete(body);
    return error;
  };
  it('Should return no error if all is ok', async () => {
    const error = exec();
    expect(error).toBeUndefined();
  });
  it('Should return an error if schema is not respected', async () => {
    const passwordCases = [123, [1, 2, 3], true, false, undefined];
    for (const e of passwordCases) {
      adminDeletePassword = e;
      const error = exec();
      expect(error).toBeDefined();
    }
  });
});

});