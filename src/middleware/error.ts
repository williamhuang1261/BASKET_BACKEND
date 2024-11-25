import { NextFunction, Request, Response } from "express";

const winston = require("winston");

const error = (err: Error, req: Request, res: Response, next: NextFunction) => {
  winston.error(err.message, err);
  res.status(500).send("Something failed");
};
//error
//warn
//info
//verbose
//debug
//silly

export default error;
