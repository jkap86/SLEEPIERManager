"use strict";

const { fetchLeague } = require("../api/sleeperApi");
const db = require("../models");
const { addLeagues } = require("./upsertLeagues");
const League = db.leagues;

const getLeague = async (league_id) => {
  const league = await League.findByPk(league_id, { raw: true });

  if (league?.rosters?.find((r) => r?.players?.length > 0)) {
    return league;
  } else {
    const leagueApi = await fetchLeague(league_id);

    const added_leagues = await addLeagues([leagueApi]);

    return added_leagues[0];
  }
};

module.exports = {
  getLeague: getLeague,
};
