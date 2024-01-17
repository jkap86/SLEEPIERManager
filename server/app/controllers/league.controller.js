"use strict";

const {
  fetchUserLeagues,
  fetchLeagueTransactions,
} = require("../api/sleeperApi");
const { getLeague } = require("../helpers/playoffPool");
const {
  splitLeagues,
  addLeagues,
  updateUserLeagueRelationships,
} = require("../helpers/upsertLeagues");
const JSONStream = require("JSONStream");
const axios = require("axios");

exports.upsert = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");

  const leagues = await fetchUserLeagues(req.query.user_id, req.query.season);

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");

  const stream = JSONStream.stringify();
  stream.pipe(res);

  const batchSize = 25;

  for (let i = 0; i < leagues.length; i += batchSize) {
    const batchLeagues = leagues.slice(i, i + batchSize);

    const [leagues_to_add, leagues_to_update, leagues_up_to_date] =
      await splitLeagues(
        batchLeagues,
        new Date(new Date() - 6 * 60 * 60 * 1000)
      );

    const updated_leagues = await addLeagues(leagues_to_update);
    const added_leagues = await addLeagues(leagues_to_add);

    await updateUserLeagueRelationships([...updated_leagues, ...added_leagues]);

    const data = [
      ...leagues_up_to_date,
      ...updated_leagues,
      ...added_leagues,
    ].map((league) => {
      const userRoster = league.rosters?.find((roster) => {
        return (
          (roster.user_id === req.query.user_id ||
            roster.co_owners?.find(
              (co) => co?.user_id === req.query.user_id
            )) &&
          (roster.players?.length > 0 || league.settings.status === "drafting")
        );
      });

      return {
        ...league,
        userRoster: userRoster,
      };
    });

    stream.write(data);
  }
  stream.end();
};

exports.picktracker = async (req, res) => {
  let active_draft;
  let league;
  let league_drafts;
  try {
    league = await axios.get(
      `https://api.sleeper.app/v1/league/${req.body.league_id}`
    );
    league_drafts = await axios.get(
      `https://api.sleeper.app/v1/league/${req.body.league_id}/drafts`
    );
    active_draft = league_drafts.data?.find(
      (d) =>
        d.settings.slots_k > 0 &&
        d.settings.rounds > league.data.settings.draft_rounds
    );
  } catch (error) {
    console.log(error);
  }

  if (active_draft) {
    const allplayers = require("../../data/allplayers.json");
    const draft_picks = await axios.get(
      `https://api.sleeper.app/v1/draft/${active_draft.draft_id}/picks`
    );
    const users = await axios.get(
      `https://api.sleeper.app/v1/league/${req.body.league_id}/users`
    );
    const teams = Object.keys(active_draft.draft_order).length;

    const picktracker = draft_picks.data
      .filter((pick) => pick.metadata.position === "K")
      .map((pick, index) => {
        return {
          pick:
            Math.floor(index / teams) +
            1 +
            "." +
            ((index % teams) + 1).toLocaleString("en-US", {
              minimumIntegerDigits: 2,
            }),
          player: allplayers[pick.player_id]?.full_name,
          player_id: pick.player_id,
          picked_by: users.data.find((u) => u.user_id === pick.picked_by)
            ?.display_name,
          picked_by_avatar: users.data.find((u) => u.user_id === pick.picked_by)
            ?.avatar,
        };
      });

    res.send({
      league: league.data,
      picks: picktracker,
    });
  } else {
    res.send([]);
  }
};

exports.find = async (req, res) => {
  const league = await getLeague(req.body.league_id);

  const transactions = await fetchLeagueTransactions(req.body.league_id, 1);

  const adds = {};

  transactions.forEach((t) =>
    Object.keys(t.adds || {}).forEach((player_id) => {
      const roster_id = t.adds[player_id];

      if (!adds[roster_id]) {
        adds[roster_id] = [];
      }

      adds[roster_id].push({
        player_id: player_id,
        timestamp: t.status_updated,
      });
    })
  );

  const drops = {};

  transactions.forEach((t) =>
    Object.keys(t.drops || {}).forEach((player_id) => {
      const roster_id = t.drops[player_id];

      if (!drops[roster_id]) {
        drops[roster_id] = [];
      }

      drops[roster_id].push({
        player_id: player_id,
        timestamp: t.status_updated,
      });
    })
  );

  res.send({
    ...league,
    adds,
    drops,
  });
};
