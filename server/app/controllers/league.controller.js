"use strict";

const { fetchUserLeagues } = require("../api/sleeperApi");
const {
  splitLeagues,
  addLeagues,
  updateUserLeagueRelationships,
} = require("../helpers/upsertLeagues");
const JSONStream = require("JSONStream");

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
        new Date(new Date() - 0.001 * 60 * 60 * 1000)
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
