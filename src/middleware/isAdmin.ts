import { NextFunction, Response } from "express";
import type { UserRequest } from "../data/interface/UserRequestProps.js";

const isAdmin = (req: UserRequest, res: Response, next: NextFunction) => {
  // Testing if the user is an admin
  if (!req.user!.account.isAdmin){
    res.status(403).send("Access denied");
    return
  }
  next();
};

export default isAdmin;
