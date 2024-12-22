import { NextFunction, Request, Response } from "express";
import winston from 'winston'

/**
 * Global error handling middleware
 * @param {Error} err - Error object thrown from anywhere in the application
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @mutates {Response} Response object with 500 status and error message
 * @description Logs the error using Winston logger and sends a generic error response
 */
const error = (err: Error, req: Request, res: Response, next: NextFunction) => {
  winston.error(err.message, err);
  res.status(500).send("Something failed");
  return
};
//error
//warn
//info
//verbose
//debug
//silly

export default error;
