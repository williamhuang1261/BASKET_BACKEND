import { NextFunction, Response } from "express";
import { UserRequest } from "../interface/RequestsProps";
import User from "../models/users";
import getAuthFirebase from "../utils/users/getAuthFirebase";
import createNewUser from "../utils/users/createNewUser";

const isLoggedIn = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {

  //Validating existence of token
  const idToken = req.header("x-auth-token");
  if (!idToken) return res.status(401).send("User is not properly logged in");

  //Validating token
  const decoded = await getAuthFirebase(idToken);
  if (!decoded) return res.status(401).send("Tampered/Invalid token");

  // Finding user in database
  let user = await User.findOne({ uid: decoded.uid });
  if (!user) {
    // Creating new User
    const newUser = await createNewUser(decoded);
    if (!newUser) return res.status(500).send("Error creating new user");
    user = newUser;
  }
  req.user = await user;
  next();
};

export default isLoggedIn;
