import { NextFunction, Response } from "express";
import { UserRequest } from "../interface/RequestsProps";

const isSupplier = (req: UserRequest, res:Response, next: NextFunction) => {
  // Testing if the user is a supplier
  if (!req.user!.account.isSupplier)
    return res.status(403).send('Access denied');
  next();
}

export default isSupplier