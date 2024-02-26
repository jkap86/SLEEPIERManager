import { getOptimalLineupADP } from "../../../Leagues/services/helpers/getOptimalLineupADP";

export const getRosterValueRankAll = (league, roster_id, type, adpLm) => {
  const value_rank =
    league.rosters
      .sort(
        (a, b) =>
          (b.players?.reduce(
            (acc, cur) => acc + (adpLm?.[type]?.[cur]?.adp || 0),
            0
          ) || 0) +
          (b.draft_picks?.reduce(
            (acc, cur) =>
              acc +
              (adpLm?.["Dynasty_auction"]?.[
                "R" +
                  ((cur.round - 1) * 12 +
                    (parseInt(
                      cur.season === parseInt(league.season) && cur.order
                    ) ||
                      Math.min(
                        6 +
                          (parseInt(cur.season) - parseInt(league.season)) * 3,
                        12
                      )))
              ]?.adp || 0),
            0
          ) || 0) -
          ((a.players?.reduce(
            (acc, cur) => acc + (adpLm?.[type]?.[cur]?.adp || 0),
            0
          ) || 0) +
            (a.draft_picks?.reduce(
              (acc, cur) =>
                acc +
                (adpLm?.[type]?.[
                  "R" +
                    +(
                      (cur.round - 1) * 12 +
                      (parseInt(
                        cur.season === parseInt(league.season) && cur.order
                      ) ||
                        Math.min(
                          6 +
                            (parseInt(cur.season) - parseInt(league.season)) *
                              3,
                          12
                        ))
                    )
                ]?.adp || 0),
              0
            ) || 0))
      )
      .findIndex((obj) => obj.roster_id === roster_id) + 1;

  return value_rank;
};

export const getRosterValueRankPlayers = (league, roster_id, type, adpLm) => {
  const value_rank_players =
    league.rosters
      .sort(
        (a, b) =>
          (b.players?.reduce(
            (acc, cur) => acc + (adpLm?.[type]?.[cur]?.adp || 0),
            0
          ) || 0) -
          (a.players?.reduce(
            (acc, cur) => acc + (adpLm?.[type]?.[cur]?.adp || 0),
            0
          ) || 0)
      )
      .findIndex((obj) => obj.roster_id === roster_id) + 1;

  return value_rank_players;
};

export const getRosterValueRankStarters = (
  league,
  roster_id,
  type,
  adpLm,
  allplayers
) => {
  const value_rank_starters =
    league.rosters
      .sort(
        (a, b) =>
          (getOptimalLineupADP({
            roster: b,
            roster_positions: league.roster_positions,
            adpLm,
            allplayers,
          })?.reduce(
            (acc, cur) => acc + (adpLm?.[type]?.[cur.player]?.adp || 0),
            0
          ) || 0) -
          (getOptimalLineupADP({
            roster: a,
            roster_positions: league.roster_positions,
            adpLm,
            allplayers,
          })?.reduce(
            (acc, cur) => acc + (adpLm?.[type]?.[cur.player]?.adp || 0),
            0
          ) || 0)
      )
      .findIndex((obj) => obj.roster_id === roster_id) + 1;

  return value_rank_starters;
};

export const getRosterValueRankPicks = (league, roster_id, type, adpLm) => {
  const value_rank_picks =
    league.rosters
      .sort(
        (a, b) =>
          (b.draft_picks?.reduce(
            (acc, cur) =>
              acc +
              (adpLm?.[type]?.[
                "R" +
                  +(
                    (cur.round - 1) * 12 +
                    (parseInt(
                      cur.season === parseInt(league.season) && cur.order
                    ) || 7)
                  )
              ]?.adp || 0),
            0
          ) || 0) -
          (a.draft_picks?.reduce(
            (acc, cur) =>
              acc +
              (adpLm?.[type]?.[
                "R" +
                  +(
                    (cur.round - 1) * 12 +
                    (parseInt(
                      cur.season === parseInt(league.season) && cur.order
                    ) || 7)
                  )
              ]?.adp || 0),
            0
          ) || 0)
      )
      .findIndex((obj) => obj.roster_id === roster_id) + 1;

  return value_rank_picks;
};
