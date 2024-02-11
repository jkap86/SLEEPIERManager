"use strict";

module.exports = (app) => {
  const router = require("express").Router();
  const draft = require("../controllers/draft.controller");

  router.post("/adp", draft.adp);

  router.post("/playercomp", draft.playercomp);

  router.post("/higher", draft.higher);

  router.post("/lower", draft.lower);

  router.post("/lm", draft.lm);

  app.use("/draft", router);
};
