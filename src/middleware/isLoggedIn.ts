import { NextFunction, Response } from "express";
import { UserRequest } from "../interface/UserRequestProps";
import User from "../models/users";
import getAuthFirebase from "../utils/users/getAuthFirebase";
import createNewUser from "../utils/users/createNewUser";

/**
 * @middleware isLoggedIn
 * @desc Authentication middleware to verify user's login status and token validity
 * @param {UserRequest} req - Express request object with custom user property
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Calls next() if authentication successful, sends error response otherwise
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

    // Setting user
    user = newUser;
  }
  req.user = await user;
  next();
};

export default isLoggedIn;
