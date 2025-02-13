import { NextFunction, Request, Response } from "express"

const restricted = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development'){
    res.status(403).send('Forbidden')
    return
  }
  else {
    next();
  }
}

export default restricted;