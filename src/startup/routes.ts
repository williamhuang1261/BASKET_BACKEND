import express, { Application } from "express";
import users_router from '../routes/users/users_routes'
// import search from "../routes/search";
// import items from "../routes/items";
// import suppliers from "../routes/suppliers";
import error from "../middleware/error";

const routes = (app: Application) => {
  app.use(express.json());
  app.use("/users", users_router);
  // app.use("/items", items);
  // app.use("/suppliers", suppliers);
  // app.use("/search", search);
  app.use(error);
};

export default routes;
