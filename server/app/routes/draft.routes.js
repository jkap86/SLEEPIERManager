"use strict";

module.exports = (app) => {
  const router = require("express").Router();
  const draft = require("../controllers/draft.controller");

  router.post("/adp", draft.adp);

  router.post("/playercomp", draft.playercomp);

  app.use("/draft", router);
};
