import { Request } from "express";
import UserProps from "./UserProps";
import mongoose from "mongoose";

interface UserRequest extends Request {
  user?: mongoose.Document<unknown, {}, UserProps> & UserProps & {
    _id: mongoose.Types.ObjectId;
} | null;
}

export { UserRequest }