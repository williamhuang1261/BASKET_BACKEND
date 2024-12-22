import { NextFunction, Response } from "express";
import { UserRequest } from "../interface/UserRequestProps.js";
import User from "../models/users.js";
import getAuthFirebase from "../utils/users/getAuthFirebase.js";
import createNewUser from "../utils/users/createNewUser.js";

/**
 * @middleware isLoggedIn
 * @desc Authentication middleware to verify user's login status and token validity
 * @param {UserRequest} req - Express request object with custom user property
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @mutates {Response} Calls next() if authentication successful, attaches error
 *   message if authentication fails
 * @throws {401} If token is missing or invalid
 * @throws {500} If new user creation fails
 * @example
 * // Success case: moves to next middleware
 * next()
 *
 * // Error cases
 * res.status(401).send("User is not properly logged in")
 * res.status(401).send("Tampered/Invalid token")
 * res.status(500).send("Error creating new user")
 */
const isLoggedIn = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  //Validating existence of token
  const idToken = req.header("x-auth-token");
  if (!idToken){
    res.status(401).send("User is not properly logged in");
    return
  }

  //Validating token
  const decoded = await getAuthFirebase(idToken);
  if (!decoded){
    res.status(401).send("Tampered/Invalid token");
    return
  }

  // Finding user in database
  let user = await User.findOne({ uid: decoded.uid });
  if (!user) {
    // Creating new User
    const newUser = await createNewUser(decoded);
    if (!newUser){
      res.status(500).send("Error creating new user");
      return
    }

    // Setting user
    user = newUser;
  }
  req.user = user;
  next();
};

export default isLoggedIn;
