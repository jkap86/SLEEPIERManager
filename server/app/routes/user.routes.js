"use strict";

module.exports = (app) => {
  const router = require("express").Router();
  const users = require("../controllers/user.controller");

  router.get("/upsert", users.upsert);

  router.get("/lmplayershares", users.lmplayershares);

  app.use("/user", router);
};
