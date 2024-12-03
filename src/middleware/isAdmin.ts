import { NextFunction, Request, Response } from "express";
import { UserRequest } from "../interface/UserRequestProps";

const isAdmin = (req: UserRequest, res: Response, next: NextFunction) => {
  // Testing if the user is an admin
  if (!req.user!.account.isAdmin) return res.status(403).send("Access denied");
  next();
};

export default isAdmin;
