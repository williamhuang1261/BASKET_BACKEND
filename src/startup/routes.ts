import express, { Application } from "express";
import users_router from '../routes/users/users_routes'
import error from "../middleware/error";

/**
 * @description Initializes all application routes and middleware
 * @param {Application} app - Express application instance
 * @example
 * routes(app);
 */
const routes = (app: Application) => {
  app.use(express.json());
  app.use("/users", users_router);

  app.use(error);
};

export default routes;
