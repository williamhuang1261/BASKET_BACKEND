const bcrypt = require("bcrypt");

// TODO: Adjust types for user and body
async function checkAuthPassword(user: any, body: any) {
  const checkPassword = async (passwordType: string, metaType: string) => {
    const validPassword = await bcrypt.compare(
      body[passwordType],
      user.meta[metaType]
    );
    return validPassword;
  };

  if (user.account.isSupplier) {
    if (
      body.supplierAddPassword &&
      !(await checkPassword("supplierAddPassword", "supplierAdd"))
    )
      return false;
    if (
      body.supplierUpdatePassword &&
      !(await checkPassword("supplierUpdatePassword", "supplierUpdate"))
    )
      return false;
    if (
      body.supplierDeletePassword &&
      !(await checkPassword("supplierDeletePassword", "supplierDelete"))
    )
      return false;
    if (
      body.supplierGetPassword &&
      !(await checkPassword("supplierGetPassword", "supplierGet"))
    )
      return false;
    if (
      !body.supplierAddPassword &&
      !body.supplierUpdatePassword &&
      !body.supplierDeletePassword &&
      !body.supplierGetPassword
    )
      return false;
  }

  if (user.account.isAdmin) {
    if (
      body.adminAddPassword &&
      !(await checkPassword("adminAddPassword", "adminAdd"))
    )
      return false;
    if (
      body.adminUpdatePassword &&
      !(await checkPassword("adminUpdatePassword", "adminUpdate"))
    )
      return false;
    if (
      body.adminDeletePassword &&
      !(await checkPassword("adminDeletePassword", "adminDelete"))
    )
      return false;
    if (
      body.adminGetPassword &&
      !(await checkPassword("adminGetPassword", "adminGet"))
    )
      return false;
    if (
      !body.adminAddPassword &&
      !body.adminUpdatePassword &&
      !body.adminDeletePassword &&
      !body.adminGetPassword
    )
      return false;
  }

  return true;
}

export default checkAuthPassword
