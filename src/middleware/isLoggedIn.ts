import { NextFunction, Response } from "express";
import User from "../models/users.js";
import { getAuth } from "firebase-admin/auth";
import { UserRequest } from "../interface/RequestsProps.js";

const isLoggedIn = async (req: UserRequest, res: Response, next: NextFunction) => {
  //Validating existence of token
  const idToken = req.header('x-auth-token');
  if(!idToken)
    return res.status(401).send('User is not properly logged in');

  //Validating token
  try{
    const decoded = await getAuth().verifyIdToken(idToken);
    const user = await User.findOne({uid: decoded.uid});
    if(!user)
      return res.status(400).send('This user does not exist')
    req.user = user
    next();
  }
  catch(ex){
    return res.status(400).send('Invalid token.');
  }
}

export default isLoggedIn;
