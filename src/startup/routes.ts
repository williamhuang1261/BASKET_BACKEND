import express, { Application } from "express";
import users_routes from "../routes/users/users_routes.js";
import restricted_routes from '../routes/restricted_route.js'
import error from "../middleware/error.js";
import test from '../routes/test.js'
import cors from 'cors'
import rateLimiter from "../middleware/rateLimiter.js";


/**
 * @description Initializes all application routes and middleware
 * @param {Application} app - Express application instance
 */
const routes = (app: Application) => {
  app.use(cors())
  app.use(rateLimiter);
  app.use(express.json());
  app.use("/users", users_routes);
  app.use('/restricted', restricted_routes)
  app.use('/test', test)
  app.use(error);
};

export default routes;