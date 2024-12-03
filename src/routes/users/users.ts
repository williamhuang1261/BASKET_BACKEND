import express, { Response } from "express";
import { UserRequest } from "../../interface/UserRequestProps";
import isLoggedIn from "../../middleware/isLoggedIn";

const router = express.Router();

// // TODO Handle all new informations that were added to users

// router.get("/", isLoggedIn, isAdmin, async (req: UserRequest, res: Response) => {
//   //Testing if admin has good password
//   const validPassword = await checkAuthPassword(req.user, req.body);
//   if (!validPassword) return res.status(401).send("Invalid password");

//   //Testing if blocked data is requested
//   if (req.body.filters.match("password", "meta")) {
//     //Log attempt
//     return res.status(400).send("Data cannot be given");
//   }

//   //Sending requested user data
//   const users = await User.find().select(req.body.filters);
//   res.status(200).send(users);
// });

// router.put("/:id", isLoggedIn, isAdmin, async (req: UserRequest, res: Response) => {
//   //Validating req.body
//   const { error } = validateUserUpdateByAdmin(req.body);
//   if (error) return res.status(400).send(error.details[0].message);

//   //Testing if admin has good password
//   const validPassword = await checkAuthPassword(req.user, req.body);
//   if (!validPassword) return res.status(401).send("Invalid password");

//   //Testing request
//   if (!mongoose.Types.ObjectId.isValid(req.params.id))
//     return res.status(404).send("The user does not exist");

//   //Testing existence of user
//   const user = await User.findById(req.params.id);
//   if (!user) return res.status(404).send("User not found");

//   //Modifying name
//   if (req.body.name) user.name = req.body.name;

//   //Modifying email
//   if (req.body.email) {
//     let existingUser = await User.findOne({ email: req.body.email });
//     if (existingUser) return res.status(400).send("Email already registered");
//     user.email = req.body.email;
//   }

//   //Modifying password
//   if (req.body.password) {
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(req.body.password, salt);
//   }

//   //Giving Supplier / Admin status to an account

//   //Saving and sending
//   await user.save();
//   res.send(_.pick(user, ["_id", "name", "email", "isSupplier", "isAdmin"]));
// });

// router.delete("/me", isLoggedIn, async (req: UserRequest, res: Response) => {
//   //Testing password
//   const validPassword = await bcrypt.compare(
//     req.body.password,
//     req.user.password
//   );
//   if (!validPassword) return res.status(401).send("Invalid password");

//   //Deleting user
//   await req.user!.deleteOne();
//   res.status(200).send("Deletion successful");
// });

// router.delete(
//   "/:id",
//   isLoggedIn,
//   isAdmin,
//   async (req: Request, res: Response) => {
//     //Testing if admin has good password
//     const validPassword = await checkAuthPassword(req.user, req.body);
//     if (!validPassword) return res.status(401).send("Invalid password");

//     //Testing request
//     if (!mongoose.Types.ObjectId.isValid(req.params.id))
//       return res.status(404).send("The user does not exist");

//     //Testing existence of user
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).send("User not found");

//     //Deleting user
//     await user.deleteOne();
//     const validation = await User.findById(user._id);
//     if (!validation) return res.status(200).send("Deletion successful");
//     return res.status(500).send("The account could not be deleted");
//   }
// );

// router.put(
//   "/authorization/me",
//   isLoggedIn,
//   isSupplier,
//   async (req: UserRequest, res: Response) => {
//     //Validating body info
//     const { error } = valAuthModify(req.body);
//     if (error) return res.status(400).send(error.details[0].message);

//     //Check all passwords
//     const validPassword = await checkAuthPassword(req.user, req.body);
//     if (!validPassword) return res.status(401).send("Invalid password(s)");

//     //Assigning new password
//     const user = req.user;
//     const body = req.body;
//     if (body.newSupplierAddPassword)
//       user.meta.supplierAdd = body.newSupplierAddPassword;
//     if (body.newSupplierUpdatePassword)
//       user.meta.supplierUpdate = body.newSupplierUpdatePassword;
//     if (body.newSupplierDeletePassword)
//       user.meta.supplierDelete = body.newSupplierDeletePassword;
//     if (body.newSupplierGetPassword)
//       user.meta.supplierGet = body.newSupplierGetPassword;
//     await user.save();

//     return res.status(200).send("Password modifications were successful");
//   }
// );

// router.put(
//   "/authorization/:id",
//   isLoggedIn,
//   isAdmin,
//   async (req: UserRequest, res: Response) => {
//     //Validating body info
//     const { error } = valAuthCreate(req.body);
//     if (error) return res.status(400).send(error.details[0].message);

//     //Check all passwords
//     const validPassword = await checkAuthPassword(req.user, req.body);
//     if (!validPassword) return res.status(401).send("Invalid password(s)");

//     //Testing request
//     if (!mongoose.Types.ObjectId.isValid(req.params.id))
//       return res.status(404).send("The user does not exist");

//     //Find user
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).send("User does not exist");

//     //Assign supplier status to user
//     user.meta = {
//       supplier: req.body.supplierName,
//       supplierAdd: req.body.supplierAddPassword,
//       supplierUpdate: req.body.supplierUpdatePassword,
//       supplierDelete: req.body.supplierDeletePassword,
//       supplierGet: req.body.supplierGetPassword,
//     };
//     user.account.isSupplier = true;
//     await user.save();

//     return res.status(200).send(`Supplier status has been given successfully`);
//   }
// );

// router.delete(
//   "/authorization/:id",
//   isLoggedIn,
//   isAdmin,
//   async (req: UserRequest, res: Response) => {
//     //Validating body info
//     const { error } = valAuthDel(req.body);
//     if (error) return res.status(400).send(error.details[0].message);

//     //Check all passwords
//     const validPassword = await checkAuthPassword(req.user, req.body);
//     if (!validPassword) return res.status(401).send("Invalid password(s)");

//     //Find user
//     if (!mongoose.Types.ObjectId.isValid(req.params.id))
//       return res.status(404).send("The user does not exist");
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).send("User does not exist");

//     //Removing supplier status
//     user.account.isSupplier = false;
//     user.meta.supplier = undefined;
//     user.meta.supplierGet = undefined;
//     user.meta.supplierAdd = undefined;
//     user.meta.supplierUpdate = undefined;
//     user.meta.supplierDelete = undefined;
//     await user.save();

//     //To remove admin status, the database must be directly accessed
//     return res.status(200).send(`Supplier status has been removed`);
//   }
// );

export default router;
