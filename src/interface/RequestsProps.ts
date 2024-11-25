import { Request } from "express";
import UserProps from "./UserProps.js";

interface UserRequest extends Request {
  user?: UserProps | null;
}

export { UserRequest }