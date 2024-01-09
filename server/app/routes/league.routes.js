"use strict";

module.exports = (app) => {
  const router = require("express").Router();
  const league = require("../controllers/league.controller");

  router.get("/upsert", league.upsert);

  router.post("/draft", async (req, res) => {
    league.picktracker(req, res, app);
  });

  router.post("/find", league.find);

  app.use("/league", router);
};
