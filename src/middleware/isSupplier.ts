import { NextFunction, Response } from "express";
import { UserRequest } from "../interface/UserRequestProps.js";

const isSupplier = (req: UserRequest, res: Response, next: NextFunction) => {
  // Testing if the user is a supplier
  if (!req.user!.account.isSupplier){
    res.status(403).send("Access denied");
    return
  }
  next();
};

export default isSupplier;
