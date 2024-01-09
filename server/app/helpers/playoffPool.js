"use strict";

const db = require("../models");
const League = db.leagues;

const getLeague = async (league_id) => {
  const league = await League.findByPk(league_id, { raw: true });

  return league;
};

module.exports = {
  getLeague: getLeague,
};
