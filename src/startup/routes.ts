import express, { Application } from "express";
import users from "../routes/users.js";
import logIn from "../routes/login.js";
import search from "../routes/search.js";
import items from "../routes/items.js";
import suppliers from "../routes/suppliers.js";
import confirmations from "../routes/confirmations.js";
import error from "../middleware/error.js";

const routes = (app: Application) => {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/login", logIn);
  app.use("/api/confirmations", confirmations);
  app.use("/api/items", items);
  app.use("/api/suppliers", suppliers);
  app.use("/api/search", search);
  app.use(error);
};

export default routes;
